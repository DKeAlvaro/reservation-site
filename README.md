# 🍽️ Simple Reservation System

A clean, modern reservation landing page for your business. Built with HTML, CSS, and JavaScript — no backend required!

## Features

- 📱 **Mobile-friendly** responsive design
- 📧 **Email notifications** via Web3Forms (free tier)
- 🎨 **Beautiful UI** with smooth animations
- ✅ **Form validation** on client side
- 🔒 **No backend** - fully static, host on GitHub Pages

## Live Demo

[View Live Site](https://yourusername.github.io/reservation-site/)

## Quick Setup (5 minutes)

### 1. Get Your Free Web3Forms Key

1. Go to [web3forms.com](https://web3forms.com)
2. Enter your email address
3. Copy your **Access Key**

### 2. Configure the Site

Open `index.html` and replace these two values:

```javascript
const WEB3FORMS_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE'; // Paste your key here
const BUSINESS_EMAIL = 'your@email.com'; // Your email to receive reservations
```

### 3. Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Upload all files from this folder
3. Go to **Settings → Pages**
4. Select **main** branch as source
5. Your site will be live at `https://yourusername.github.io/reservation-site/`

## How It Works

1. **Customer fills out the form** → Name, email, date, time, party size
2. **Form submits to Web3Forms** → Free form backend service
3. **You receive an email** → With all reservation details
4. **Customer sees confirmation** → Success message on screen

## Customization

### Change Time Slots

Edit the time options in the `<select>` element:

```html
<select id="time" name="time">
    <option value="12:00">12:00 PM</option>
    <option value="13:00">1:00 PM</option>
    <!-- Add your own times -->
</select>
```

### Change Max Party Size

Edit the guest options:

```html
<select id="guests" name="guests">
    <option value="1">1 Person</option>
    <option value="2">2 People</option>
    <!-- Add or remove options -->
</select>
```

### Change Colors

Edit the CSS variables at the top of the `<style>` section:

```css
:root {
    --primary: #2563eb;      /* Main brand color */
    --primary-dark: #1d4ed8; /* Darker shade */
    --primary-light: #dbeafe; /* Lighter shade */
}
```

## Optional: Show Availability

To show real-time availability, you can:

1. **Google Sheets method:**
   - Create a Google Form connected to a Sheet
   - Embed the Sheet as a read-only iframe
   - Update it manually or via Zapier

2. **Airtable method:**
   - Create an Airtable base with reservations
   - Use Airtable's calendar view
   - Embed it in your site

## Tech Stack

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- [Web3Forms](https://web3forms.com) for form handling
- [Google Fonts](https://fonts.google.com) (Inter)

## License

MIT - Feel free to use this for any project!

---

Built with ❤️ for easy reservations
