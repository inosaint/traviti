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

    // Validate input
    if (!destination || !days || !budget || !tripType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    if (days < 1 || days > 30) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Days must be between 1 and 30' })
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

    const prompt = `Create a detailed ${days}-day travel itinerary for ${destination}. 

Trip details:
- Budget: ${budgetDescription[budget]}
- Traveler type: ${tripTypeDescription[tripType]}
${interestsText}

For each day, provide:
1. A descriptive title (e.g., "Day 1 - Arrival & City Exploration")
2. Hotel recommendation matching the budget level (include star rating)
3. A schedule table with three columns: When (Morning/Afternoon/Evening), What (activity), Notes (practical tips)
4. 3-5 activities per day, balanced and realistic

Format the response as a JSON array of day objects with this structure:
[
  {
    "day": 1,
    "title": "Day 1 - Arrival & City Exploration",
    "hotel": "Hotel Name (3★)",
    "activities": [
      {
        "when": "Morning",
        "what": "Activity description",
        "notes": "Practical tips"
      }
    ]
  }
]

IMPORTANT: Return ONLY the JSON array, with no markdown formatting, no code blocks, no explanatory text. Just the raw JSON array.

Make sure the itinerary is realistic, culturally appropriate, and includes a mix of must-see attractions and authentic local experiences. Consider travel time between locations and don't overpack the schedule.`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
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
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to generate itinerary' })
      };
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response (Claude might wrap it in markdown despite instructions)
    let itinerary;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Could not parse itinerary response');
      }
      itinerary = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse response:', content);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to parse itinerary response' })
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
