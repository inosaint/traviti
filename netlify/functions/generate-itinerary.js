// netlify/functions/generate-itinerary.js

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { destination, days, budget, tripType, interests } = JSON.parse(event.body);

    // Validate and sanitize input
    if (!destination || !days || !budget || !tripType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Sanitize destination - allow natural language but prevent injection
    const sanitizedDestination = destination
      .trim()
      .replace(/[<>{}[\]\\]/g, '') // Remove only potentially harmful characters
      .substring(0, 200); // Limit length

    if (!sanitizedDestination || sanitizedDestination.length < 2) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid destination name' })
      };
    }

    if (days < 1 || days > 30) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Days must be between 1 and 30' })
      };
    }
    
    // Validate budget and tripType are from expected values
    const validBudgets = ['budget', 'mid-range', 'luxury'];
    const validTripTypes = ['solo', 'couple', 'family', 'friends'];
    
    if (!validBudgets.includes(budget)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid budget selection' })
      };
    }
    
    if (!validTripTypes.includes(tripType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid trip type selection' })
      };
    }

    // Build the prompt
    const budgetDescription = {
      'budget': 'budget-friendly accommodations and meals',
      'mid-range': 'comfortable 3-4 star hotels and a mix of local and nicer restaurants',
      'luxury': '5-star hotels, fine dining, and premium experiences'
    };

    const tripTypeDescription = {
      'solo': 'solo traveler with flexible pacing',
      'couple': 'couple seeking romantic and memorable experiences',
      'family': 'family with children, requiring family-friendly activities and moderate pacing',
      'friends': 'group of friends looking for fun and social activities'
    };

    const interestsText = interests && interests.length > 0
      ? `Focus on these interests: ${interests.join(', ')}.`
      : '';
    
    // Add interest prefix to destination if interests are selected
    let destinationWithPrefix = sanitizedDestination;
    if (interests && interests.length > 0) {
      const interestPrefixes = {
        'culture': 'Cultural',
        'adventure': 'Adventure-focused',
        'food': 'Culinary',
        'relaxation': 'Wellness-focused',
        'nature': 'Nature-oriented',
        'nightlife': 'Vibrant'
      };
      const primaryInterest = interests[0];
      const prefix = interestPrefixes[primaryInterest] || '';
      if (prefix) {
        destinationWithPrefix = `${prefix} ${sanitizedDestination}`;
      }
    }

    const prompt = `Create a ${days}-day travel itinerary for ${destinationWithPrefix}. 

Trip: ${budgetDescription[budget]}, ${tripTypeDescription[tripType]}. ${interestsText}

CRITICAL: Return ONLY a valid JSON array with NO other text, markdown, or explanations.

Format (use this exact structure):
[
  {
    "day": 1,
    "title": "Day 1 - Brief Title",
    "hotel": "Hotel Name (4★)",
    "activities": [
      {"when": "Morning", "what": "Activity description", "notes": "Brief practical tip"}
    ]
  }
]

Requirements:
- Include ALL ${days} days in the array
- 3-4 activities per day (Morning, Afternoon, Evening)
- Keep descriptions concise
- Return ONLY the JSON array, nothing else`;

    // Try to get the API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Call Anthropic API - using claude-sonnet-4-5-20250929
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5', // Much faster than Sonnet, still great quality
        max_tokens: 4096, // Increased for longer itineraries
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Anthropic API error:', error);
      
      // Return more specific error message
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: error.error?.message || 'Failed to generate itinerary',
          details: error
        })
      };
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Improved JSON extraction - handle multiple formats
    let itinerary;
    try {
      // Try to parse directly first
      itinerary = JSON.parse(content);
    } catch (e) {
      // If that fails, try to extract JSON from markdown or other wrapping
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          itinerary = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Failed to parse extracted JSON:', jsonMatch[0]);
          return {
            statusCode: 500,
            body: JSON.stringify({ 
              error: 'Failed to parse itinerary response',
              raw: content.substring(0, 200) // Show first 200 chars for debugging
            })
          };
        }
      } else {
        console.error('No JSON found in response:', content);
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'No valid itinerary found in response',
            raw: content.substring(0, 200)
          })
        };
      }
    }
    
    // Validate the itinerary structure
    if (!Array.isArray(itinerary) || itinerary.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Invalid itinerary format - expected non-empty array'
        })
      };
    }

    // Return the itinerary
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itinerary })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};