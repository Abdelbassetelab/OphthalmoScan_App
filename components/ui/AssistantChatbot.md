# AssistantChatbot Component

A sophisticated chat assistant for the OphthalmoScan-AI application, designed to help users with questions about ophthalmology and platform usage.

## Features

- Floating chat button fixed to bottom-right of all pages
- Expandable chat window with smooth animations
- Professional medical aesthetic with blue gradients
- Fully responsive design that works on mobile devices
- Keyboard accessibility and ARIA support
- Sample responses for demonstration purposes

## Integration

The AssistantChatbot is already integrated into the application's root layout. The component:

1. Uses styled-components for styling
2. Is dynamically imported to avoid SSR issues
3. Includes a StyledComponentsProvider for theme consistency

## Customization

### Chatbot Appearance

To modify the appearance of the chatbot, you can adjust the styled components in `AssistantChatbot.tsx`. The primary colors and gradients can be changed to match any design updates.

### Response Logic

Currently, the chatbot uses sample responses. To implement actual AI responses or connect to a backend:

1. Modify the `sendMessage` function in `AssistantChatbot.tsx`
2. Replace the random response logic with API calls to your backend service
3. Handle loading states and error scenarios

## Accessibility

The component includes:
- ARIA labels for all interactive elements
- Keyboard navigation support
- Focus management when opening/closing the chat
- High contrast colors for readability

## Dependencies

- styled-components
- @emotion/is-prop-valid
- lucide-react (for icons)
- next/dynamic (for SSR handling)
