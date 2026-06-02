# Simple Reservation System

Static HTML/CSS/JS reservation page. No backend - form submissions go to email via [Web3Forms](https://web3forms.com).

## Setup

1. Get a free access key at [web3forms.com](https://web3forms.com).
2. In `index.html`, set:
   ```js
   const WEB3FORMS_ACCESS_KEY = 'your-key';
   const BUSINESS_EMAIL = 'your@email.com';
   ```
3. Push to GitHub and enable Pages (Settings -> Pages -> `main` / root).

## Local Testing

```bash
python -m http.server 8080
# http://localhost:8080
```

## Customizing

- **Time slots / party size:** edit the `<select>` options in `index.html`.
- **Colors:** edit the `--primary*` CSS variables in the `<style>` block.

## Tech

HTML, CSS, vanilla JS, Web3Forms, Inter (Google Fonts).

## License

MIT
