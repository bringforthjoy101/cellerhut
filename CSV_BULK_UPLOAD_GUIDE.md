# CSV Bulk Upload Feature - User Guide

## Overview
The CSV Bulk Upload feature allows administrators to upload multiple products to the inventory system at once using CSV or Excel files. This feature significantly reduces the time needed to add large quantities of products.

## How to Access
1. Navigate to the Products section
2. Click the **"Bulk Upload"** button (green outline button with upload icon)
3. The CSV Upload Modal will open

## Upload Process

### Step 1: Download Template
- Click "Download Template" to get a properly formatted Excel file
- The template includes all required and optional fields with sample data
- Use this template to ensure your data is in the correct format

### Step 2: Prepare Your Data
Required fields:
- `name` - Product name (required)

Optional fields:
- `description` - Product description
- `qty` - Quantity (number)
- `price` - Selling price (number)
- `costPrice` - Cost price (number)  
- `packagingPrice` - Packaging cost (number)
- `unit` - Unit type (bottle, case, box, dozen, kg, pck, pcs, l, g, crate, carton)
- `unitValue` - Unit value (number)
- `sku` - Stock keeping unit code
- `barcode` - Product barcode
- `categoryId` - Category ID (number)
- `tax_rate` - Tax rate percentage (number)
- `tax_inclusive` - Whether price includes tax (true/false)
- `alcohol_content` - Alcohol percentage for beverages (number)
- `volume` - Product volume (e.g., "750ml")
- `origin` - Product origin/country
- `vintage` - Year for wine/spirits (number)

### Step 3: Upload File
- Drag and drop your CSV/Excel file into the upload area
- Supported formats: .csv, .xlsx, .xls
- Maximum 1 file at a time

### Step 4: Preview and Validate
- The system will automatically validate your data
- View preview table showing all rows
- Valid rows are highlighted in green
- Error rows are highlighted in red with specific error messages
- Use the search function to find specific products in large uploads

### Step 5: Upload Products
- Review the validation summary (Valid vs Errors count)
- Click "Upload X Products" to proceed with valid products only
- Invalid rows will be skipped - fix them and upload separately
- Progress bar shows upload status

### Step 6: Completion
- Success screen shows upload results
- New products are automatically added to inventory
- Product list refreshes to show new items

## Validation Rules

### Data Type Validation
- `qty`, `price`, `costPrice`, `packagingPrice`, `unitValue`, `categoryId`, `tax_rate`, `alcohol_content`, `vintage` must be numbers
- `tax_inclusive` must be true or false
- `unit` must be one of the allowed values

### Business Logic
- Product names must be unique (duplicates will be skipped)
- All numeric fields must be valid numbers
- Category IDs must exist in the system

## Error Handling
- Invalid data types show specific error messages
- Duplicate product names are reported
- Network errors are handled gracefully
- Partial uploads are supported (valid rows proceed, invalid rows are skipped)

## Best Practices

### File Preparation
1. Always use the provided template as a starting point
2. Fill in required fields first (name is mandatory)
3. Use consistent formatting for similar data
4. Avoid special characters that might break CSV parsing
5. Test with a small batch first before uploading large files

### Data Entry
1. Use consistent unit types across similar products
2. Ensure category IDs match existing categories
3. Use proper decimal formatting (e.g., 15.00 not 15)
4. Boolean values should be exactly "true" or "false"

### Troubleshooting
1. If upload fails, check for:
   - Missing required fields
   - Invalid data types
   - Duplicate product names
   - Network connectivity
2. Use the search function in preview to quickly find problematic rows
3. Fix errors and re-upload only the corrected rows

## Technical Notes
- Maximum recommended file size: 5MB
- Maximum recommended rows: 1000 products per upload
- Upload timeout: 2 minutes
- Invalid rows are skipped, valid rows are processed
- Duplicate product names (by name field) are automatically skipped

## Sample CSV Format
```csv
name,description,qty,price,costPrice,packagingPrice,unit,unitValue,sku,barcode,categoryId,tax_rate,tax_inclusive
"Premium Wine","Aged wine from vineyard",10,45.99,28.00,3.50,bottle,750,PW001,1234567890123,1,15.00,true
"Craft Beer","Local brewery beer",50,8.99,5.00,1.00,bottle,330,CB001,1234567890124,2,10.00,false
```

## Security & Permissions
- Only users with 'admin' role can access bulk upload
- All uploads are logged for audit purposes
- File validation prevents malicious file uploads
- Data validation prevents injection attacks

## Support
If you encounter issues with the bulk upload feature:
1. Check this guide for troubleshooting steps
2. Verify your data format against the template
3. Test with a smaller file first
4. Contact technical support if problems persist