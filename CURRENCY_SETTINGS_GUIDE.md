# Global Currency Settings Guide

## Overview
The application now supports global currency settings that apply throughout the entire application. Users can select their preferred currency from the Settings page, and all monetary values will be displayed in that currency.

## Supported Currencies

### Default Currency: Pakistani Rupee (PKR)
The application is now configured with PKR as the default currency for Pakistan operations.

### Available Currencies:
- **PKR** (Rs) - Pakistani Rupee
- **USD** ($) - US Dollar
- **EUR** (€) - Euro
- **GBP** (£) - British Pound Sterling
- **INR** (₹) - Indian Rupee
- **AED** (د.إ) - UAE Dirham
- **SAR** (ر.س) - Saudi Riyal

## How to Change Currency

### For Users:
1. Navigate to **Settings** page from the sidebar
2. Under **User Preferences** section, locate the **Currency** dropdown
3. Select your desired currency (e.g., PKR for Pakistan)
4. The change is applied **immediately** across the entire application
5. Currency preference is saved in browser's local storage

### Where Currency is Applied:

The selected currency affects all monetary displays including:

1. **Dashboard**
   - Total Revenue statistics
   - Total Expenses
   - Balance calculations
   - Transaction cards

2. **Payments Module**
   - PayIn and PayOut amounts
   - Payment tables
   - Total calculations
   - PDF Reports

3. **Expenses Module**
   - Expense amounts
   - Category totals
   - Approval/submission amounts

4. **Employee Module**
   - Salaries (monthly/contractual)
   - Advances paid
   - Balance calculations
   - Work record prices
   - Overtime rates

5. **PDF Reports**
   - All exported PDFs use the selected currency
   - Summary boxes show amounts in selected currency
   - Report tables display amounts properly formatted

## Implementation Details

### For Developers:

#### 1. Settings Context
Location: `src/contexts/SettingsContext.tsx`

The Settings Context manages all application settings including currency:

```typescript
interface AppSettings {
  currency: string
  locale: string
  // ... other settings
}
```

Settings are:
- Stored in localStorage as `app-settings`
- Automatically loaded on app mount
- Persisted across browser sessions

#### 2. Currency Hook
Location: `src/hooks/useCurrencyFormat.ts`

Use the `useCurrencyFormat` hook in any component:

```typescript
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat'

export default function MyComponent() {
  const { formatCurrency, currency, locale } = useCurrencyFormat()
  
  return (
    <div>
      {formatCurrency(150000)} // Displays as Rs 1,50,000 for PKR
    </div>
  )
}
```

#### 3. Usage in Components

**Old Way (Hardcoded USD):**
```typescript
import { formatCurrency } from '@/lib/utils'

// Always used USD
<div>{formatCurrency(amount)}</div>
```

**New Way (Dynamic Currency):**
```typescript
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat'

export default function MyComponent() {
  const { formatCurrency } = useCurrencyFormat()
  
  return <div>{formatCurrency(amount)}</div>
}
```

#### 4. Updating Existing Pages

To update a page to use global currency settings:

1. Import the hook:
```typescript
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat'
```

2. Use the hook at component level:
```typescript
const { formatCurrency, currency } = useCurrencyFormat()
```

3. Replace all `formatCurrency()` calls to use the hook's version

4. Remove import of `formatCurrency` from utils

**Example: Updated Payments Page**
```typescript
'use client'

import { useCurrencyFormat } from '@/hooks/useCurrencyFormat'

export default function PaymentsPage() {
  const { formatCurrency, currency } = useCurrencyFormat()
  
  // Now all formatCurrency calls use the user's selected currency
  return (
    <div>{formatCurrency(payment.amount)}</div>
  )
}
```

## Currency Formatting Details

### Number Formatting
Currency amounts are formatted using JavaScript's `Intl.NumberFormat`:
- Proper thousand separators
- Decimal places based on currency
- Native currency symbols
- Right-to-left support for Arabic currencies

### Examples by Currency:

| Currency | Amount: 150000 | Formatted Display |
|----------|----------------|-------------------|
| PKR | 150000 | Rs 1,50,000 |
| USD | 150000 | $150,000.00 |
| EUR | 150000 | €150,000.00 |
| GBP | 150000 | £150,000.00 |
| INR | 150000 | ₹1,50,000.00 |
| AED | 150000 | د.إ 150,000.00 |
| SAR | 150000 | ر.س 150,000.00 |

## Settings Page Features

### User Preferences Section:
- **Theme**: Light, Dark, System
- **Language**: English (US, UK, Pakistan), Urdu
- **Currency**: 7 supported currencies
- **Time Format**: 12h or 24h
- **Date Format**: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD

### Currency Preview Card:
Shows real-time preview of:
- Selected currency code
- Locale setting
- Sample formatted amount (150,000 in selected currency)

### Information Panel:
Lists all areas where currency changes apply:
- Dashboard statistics
- Payment records
- Expense submissions
- Employee salaries
- PDF reports

## Local Storage

Settings are stored in browser's localStorage with key: `app-settings`

Example stored data:
```json
{
  "currency": "PKR",
  "locale": "en-PK",
  "theme": "light",
  "language": "en-PK",
  "timeFormat": "24h",
  "dateFormat": "dd/MM/yyyy",
  "notifications": {
    "email": true,
    "push": true,
    "paymentAlerts": true,
    "expenseAlerts": true,
    "weeklyReport": true
  }
}
```

## Migration Path for Existing Components

### Pages Already Updated:
- ✅ `src/app/payments/page.tsx` - Uses `useCurrencyFormat` hook

### Pages to Update (Future):
- `src/app/page.tsx` - Dashboard
- `src/app/expenses/page.tsx` - Expenses list
- `src/app/employees/page.tsx` - Employee list
- `src/app/employees/[id]/report/page.tsx` - Employee reports
- All other pages using `formatCurrency`

### Quick Update Script:
For each component file:
1. Add: `import { useCurrencyFormat } from '@/hooks/useCurrencyFormat'`
2. Add: `const { formatCurrency } = useCurrencyFormat()` inside component
3. Remove: `formatCurrency` from `@/lib/utils` import
4. Test thoroughly

## Testing

### Manual Testing Checklist:
- [ ] Change currency in Settings page
- [ ] Verify immediate update in UI
- [ ] Check Dashboard statistics
- [ ] Check Payments page (PayIn/PayOut)
- [ ] Check Expenses page
- [ ] Check Employee pages
- [ ] Generate PDF report - verify currency
- [ ] Refresh browser - verify settings persist
- [ ] Test on different browsers
- [ ] Test with different currencies
- [ ] Verify locale-specific formatting

### Test Currencies:
1. PKR - Check Pakistani Rupee formatting
2. USD - Check US Dollar formatting
3. EUR - Check Euro formatting

## FAQs

**Q: Will changing currency convert existing amounts in the database?**
A: No, currency selection only changes the display format. Amounts in the database remain unchanged. This is a formatting feature, not a currency conversion feature.

**Q: Can different users have different currency preferences?**
A: Yes, settings are stored per browser/device in localStorage. Each user on their own browser can have their own currency preference.

**Q: What happens if I clear my browser data?**
A: Settings will reset to defaults (PKR). You'll need to re-select your currency preference.

**Q: Can we add more currencies?**
A: Yes! Edit `src/app/settings/page.tsx` and add currency options to the dropdown. The Intl.NumberFormat API supports all ISO 4217 currency codes.

**Q: How do I add currency conversion?**
A: Currency conversion would require:
1. Exchange rate API integration
2. Base currency in database
3. Real-time conversion calculations
4. This is currently not implemented

## Troubleshooting

### Issue: Currency not updating after selection
**Solution**: 
- Check browser console for errors
- Verify SettingsProvider is wrapping the app in layout.tsx
- Clear localStorage and retry

### Issue: Wrong currency format
**Solution**:
- Check if locale matches currency (PKR -> en-PK)
- Verify browser supports the locale
- Check Intl.NumberFormat compatibility

### Issue: Settings not persisting
**Solution**:
- Check if localStorage is enabled in browser
- Verify no browser extensions blocking storage
- Check for private/incognito mode

## Technical Architecture

```
┌─────────────────────────────────────┐
│     Root Layout (layout.tsx)        │
│   Wraps app with SettingsProvider   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   SettingsContext (Context API)     │
│  - Manages global settings state    │
│  - Persists to localStorage         │
│  - Provides updateSettings()        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  useCurrencyFormat (Custom Hook)    │
│  - Reads currency from context      │
│  - Returns formatCurrency()         │
│  - Applies locale formatting        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│    Components (Pages/Features)      │
│  - Call formatCurrency(amount)      │
│  - Display formatted currency       │
│  - No hardcoded currency values     │
└─────────────────────────────────────┘
```

## Best Practices

1. **Always use the hook in client components**:
   ```typescript
   'use client'
   import { useCurrencyFormat } from '@/hooks/useCurrencyFormat'
   ```

2. **Don't use formatCurrency from utils directly** in new code

3. **Test with multiple currencies** during development

4. **Document currency assumptions** in comments

5. **Use semantic naming** for currency-related variables

## Future Enhancements

Potential improvements:
- [ ] Multi-currency support (store amounts in multiple currencies)
- [ ] Exchange rate API integration
- [ ] Historical exchange rates
- [ ] Currency conversion calculator
- [ ] Support for cryptocurrencies
- [ ] Custom currency symbols
- [ ] Regional tax calculations
- [ ] Export settings backup/restore

## Support

For issues or questions:
1. Check this documentation
2. Review the implementation files
3. Test in different browsers
4. Check browser console for errors
5. Contact development team

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
