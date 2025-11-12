# Traviti v1.1 Release Notes

## 🎉 What's New

### 1. Multiple Interest Selection
- ✅ Users can now select multiple interests (not just one)
- Added hint text: "Select multiple interests to personalize your trip"
- No limit on selections - users can choose all if they want

### 2. Clearer Interest Categories
**Updated labels for better clarity:**
- "Culture" → "History & Culture" 🏛️
- "Adventure" → "Adventure Sports" 🏔️
- "Food" → "Food & Cuisine" 🍜
- "Relaxation" → "Wellness & Spa" 🧘 (changed icon from 🌴)
- "Nature" → "Nature & Wildlife" 🌿
- "Nightlife" → "Nightlife & Entertainment" 🎭

Now clearly differentiates between:
- **Adventure Sports** (active/adrenaline activities)
- **Nature & Wildlife** (passive nature observation)
- **Wellness & Spa** (relaxation/pampering)

### 3. Fixed Long Itinerary Issues (14+ days)
**Improvements:**
- Increased max_tokens from 2048 to 4096
- Better JSON parsing with multiple fallback strategies
- More explicit prompt instructions for long itineraries
- Validates itinerary structure before returning
- Better error messages with debugging info

### 4. Improved Table Layout
**Fixed column alignment:**
- Consistent column widths across all days
- "When" column: Fixed 120px width
- "What" column: 40% of remaining space
- "Notes" column: Auto (remaining space)
- Text wraps within cells instead of expanding
- Cells align vertically across the entire itinerary

### 5. Visual Time Icons
**Morning/Afternoon/Evening indicators:**
- Morning → 🌅
- Afternoon → ☀️
- Evening → 🌆
- Night → 🌙

Icons automatically added based on activity time

### 6. Enhanced Hotel Display
**Improvements:**
- Higher contrast text (changed from light gray to black)
- Bolder font weight (500)
- Larger font size (1rem vs 0.95rem)
- Hotel icon stays green for visual accent

**Note:** Real-time ratings from Google Maps/TripAdvisor would require:
- API keys and integration
- Additional costs
- Rate limiting considerations
- Suggest for v1.2 as a premium feature

### 7. Footer Branding
Added footer with:
- "Vibed coded with [Claude logo] Claude"
- Custom Claude logo SVG in brand colors
- Centered alignment
- Subtle border separator

### 8. Favicon
- Added compass emoji (🧭) as favicon
- Matches the "explore" theme
- Works across all browsers
- SVG-based for crisp display

## 🔧 Technical Improvements

### Backend (Netlify Function)
- Better input sanitization (allows natural language)
- Improved JSON extraction (3-level fallback)
- Enhanced error messages
- Validation for itinerary structure

### Frontend
- Fixed table layout system (table-layout: fixed)
- Better word wrapping
- Improved responsive design
- Footer excluded from print view

## 📝 User Feedback Addressed

| Feedback | Status | Solution |
|----------|--------|----------|
| Select multiple interests | ✅ Fixed | Removed selection limits |
| Unclear interest categories | ✅ Fixed | Renamed & better icons |
| 14-day itinerary fails | ✅ Fixed | Increased tokens & better parsing |
| Table columns misaligned | ✅ Fixed | Fixed column widths |
| Time of day not visual | ✅ Fixed | Added emoji icons |
| Hotel text too faded | ✅ Fixed | Increased contrast & weight |
| Need footer branding | ✅ Fixed | Added "Vibed coded with Claude" |
| Missing favicon | ✅ Fixed | Added compass emoji |

## 🚀 Deployment

```bash
git add .
git commit -m "Release v1.1: Multiple interests, better parsing, visual improvements"
git push
```

## 🔮 Future Considerations (v1.2?)

- Real-time hotel ratings from Google Maps/TripAdvisor API
- User accounts & saved itineraries
- Export to PDF with custom styling
- Share itinerary via link
- Add photos for destinations
- Cost estimates per day
- Weather forecasts for travel dates
