# Oishi's Kitchen

Website and admin console for Oishi's Kitchen — Bengali catering in Malden, MA.

## Offline

After you open the site once while online, a service worker keeps the app shell (HTML, JS, CSS, logo) so closing the network and reopening or refreshing still shows the kitchen — not a blank browser error page.

Last-known menu, orders, and other React Query lists are stored in this browser's existing `localStorage` (the same place the cart already lives). There is no second database.

**Works offline (after a first online visit):**

- Home, About, Gallery, Menu, Contact, and other static pages
- Last-loaded Order Online menu (or the built-in fallback menu if nothing was cached yet)
- Cart
- Last-known admin lists: orders, menu, grocery, tasks, reviews, inventory, calendar
- Last-known My Orders for the account that was signed in
- Checkout, phone orders, event bookings, and review submissions are queued on this device and sent automatically when you are back online

**Still needs a network:**

- First visit, a new device, or a hard cache clear
- Sign in / sign up / Google OAuth
- Recording or reversing payments, changing order status, cancelling an order, and editing menu, inventory, grocery, or tasks — these fail with a clear message and are **not** queued, so kitchen and payment records cannot diverge
- Confirmation emails (EmailJS) and a live server lookup for an order that was never opened on this device
- WhatsApp / phone links

### Check it

Automated (cached shell + last-known data + write queue with the network disabled):

```bash
npm test
```

In a browser (or Playwright): load the site while online, then set the network to offline and reload. You should still see the kitchen.

```js
// Playwright
await page.goto('/');
await page.context().setOffline(true);
await page.reload();
await expect(page.getByText("Oishi's Kitchen")).toBeVisible();
```
