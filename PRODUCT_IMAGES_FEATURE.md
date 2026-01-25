# Product Multiple Images Feature

## Overview
The Product Management system now supports **multiple image uploads** for products. Both **Super Admins** and **Sub-Admins** can upload, manage, and organize multiple product images.

---

## ✨ Features

### 1. **Multiple Image Upload**
- Upload multiple images at once using file selection
- Support for all image formats (JPEG, PNG, GIF, WebP, SVG, etc.)
- Maximum file size: **5MB per image**
- Real-time validation and error messages

### 2. **Image Management**
- **View All Images**: Grid layout showing all product images
- **Primary Image**: First image is set as the primary/main image
- **Reorder Images**: Click ⭐ (star) to set any image as primary
- **Delete Images**: Remove unwanted images with 🗑️ (trash) button
- **Image Counter**: Badge showing "+X" for additional images in product list

### 3. **User Permissions**

#### Super Admin (`userType === 'admin'`)
✅ View all products across all branches
✅ Add products with multiple images
✅ Edit products and manage images
✅ Delete products and images
✅ Upload unlimited images per product

#### Sub-Admin (`userType === 'subadmin'`)
✅ View products for assigned branch
✅ Add products with multiple images
✅ Edit products and manage images
✅ Delete products and images
✅ Upload unlimited images per product

---

## 🎨 User Interface

### Product List Table
```
┌─────────────────────────────────────┐
│ Product Image with Badge            │
│ ┌──────┐                            │
│ │ IMG  │ +2  ← Shows 2 more images  │
│ └──────┘                            │
└─────────────────────────────────────┘
```

### Product Modal - Add/Edit Mode

#### Upload Section
```
┌─────────────────────────────────────┐
│ Product Images (Maximum 5MB per     │
│ image)                              │
│                                     │
│ [📷 Upload Images]  Click to select │
│                     multiple images │
└─────────────────────────────────────┘
```

#### Image Grid (with images)
```
┌─────────────────────────────────────┐
│ ┌───────┐  ┌───────┐  ┌───────┐   │
│ │       │  │       │  │       │   │
│ │ IMG 1 │  │ IMG 2 │  │ IMG 3 │   │
│ │Primary│  │ ⭐ 🗑️ │  │ ⭐ 🗑️ │   │
│ └───────┘  └───────┘  └───────┘   │
└─────────────────────────────────────┘
```

#### Empty State
```
┌─────────────────────────────────────┐
│          📷                          │
│    No images uploaded               │
└─────────────────────────────────────┘
```

---

## 📋 How to Use

### For Super Admin / Sub-Admin:

#### Adding a New Product with Images
1. Click **"+ Add Product"** button
2. Fill in product details (name, SKU, category, etc.)
3. Scroll to **"Product Images"** section
4. Click **"📷 Upload Images"** button
5. Select one or multiple image files
6. Images will appear in the grid below
7. Click **"Add Product"** to save

#### Editing Product Images
1. Click the ✏️ (edit) icon on a product
2. Scroll to **"Product Images"** section
3. **To add more images**: Click "📷 Upload Images"
4. **To remove an image**: Hover and click 🗑️ button
5. **To set primary image**: Click ⭐ button on desired image
6. Click **"Save Changes"**

#### Setting Primary Image
- The **first image** in the grid is always the primary image
- This is the image shown in product listings
- To change: Click ⭐ button on any other image
- It will move to the first position automatically

#### Deleting Images
- Hover over any image in the grid
- Click the 🗑️ (trash) button
- Image is removed immediately
- No confirmation needed (be careful!)

---

## 🔧 Technical Details

### Data Structure
```javascript
{
  id: 1,
  name: 'Samsung Galaxy S23 Ultra',
  sku: 'SAM-S23U-256',
  category: 'Smartphones',
  brand: 'Samsung',
  price: 865998,
  stock: 45,
  branch: 'Lagos Main',
  status: 'active',
  image: '/images/shop/1.jpg',      // Legacy field
  images: [                          // New field for multiple images
    '/images/shop/1.jpg',            // Primary image (index 0)
    '/images/shop/2.jpg',
    '/images/shop/3.jpg'
  ],
  description: 'Product description'
}
```

### Image Storage
- Images are converted to **base64 data URLs**
- Stored directly in the state/database
- No external file server needed (for now)

### Validation Rules
1. **File Type**: Only image files (image/*)
2. **File Size**: Maximum 5MB per image
3. **Error Messages**:
   - `"{filename} is not an image file"` - Wrong file type
   - `"{filename} is too large. Maximum size is 5MB"` - File too big
   - `"Error uploading images. Please try again."` - Upload error

---

## 🎯 Key Functions

### handleImageUpload
Handles file selection and upload process:
- Validates file type and size
- Converts to base64 data URLs
- Adds to product images array
- Shows upload progress

### handleRemoveImage
Removes an image from the product:
- Takes index of image to remove
- Filters out the image from array
- Updates product state

### handleSetPrimaryImage
Sets a specific image as primary:
- Takes index of desired primary image
- Moves it to position 0 (first)
- Other images shift accordingly

---

## 📱 Responsive Design

### Desktop
- Images displayed in flexible grid (min 120px per image)
- Upload button with hint text inline
- Hover effects on images show action buttons

### Mobile
- Grid adapts to smaller columns (min 80px per image)
- Upload section stacks vertically
- Touch-friendly button sizes

---

## ⚠️ Important Notes

### For Developers
1. Images are stored as **base64 strings** in state
2. This works for frontend-only implementation
3. For backend integration, consider:
   - Cloud storage (AWS S3, Cloudinary)
   - File upload endpoints
   - Image optimization/compression

### For Users
1. **Large images** may slow down the interface
2. Consider **resizing images** before upload
3. Recommended image size: **800x800px to 1200x1200px**
4. Use **compressed JPEG** for best performance

### Limitations
- Base64 storage increases data size (~33% overhead)
- Large number of images may affect performance
- No automatic image compression (yet)

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Image compression on upload
- [ ] Drag-and-drop file upload
- [ ] Image cropping/editing
- [ ] Lightbox/zoom view
- [ ] Drag-to-reorder images
- [ ] Bulk image upload for multiple products
- [ ] Cloud storage integration
- [ ] Image optimization (auto-resize)
- [ ] Progress bar for large uploads
- [ ] Image carousel in view mode

---

## 🐛 Troubleshooting

### Images not displaying
**Problem**: Images don't show after upload
**Solution**: 
- Check browser console for errors
- Ensure file size is under 5MB
- Try with a different image format

### Upload button not working
**Problem**: Clicking upload does nothing
**Solution**:
- Check if file input is properly connected
- Verify browser supports FileReader API
- Try refreshing the page

### Images disappear after refresh
**Problem**: Uploaded images are lost
**Solution**:
- Make sure to click "Add Product" or "Save Changes"
- Images are only saved when product is saved
- Check if backend persistence is configured

### Performance issues
**Problem**: Interface is slow with many images
**Solution**:
- Limit images to 5-10 per product
- Compress images before upload
- Consider implementing pagination

---

## 📞 Support

For issues or questions:
- Check the main `ADMIN_SYSTEM_DOCUMENTATION.md`
- Contact development team
- Submit an issue in the project repository

---

**Version**: 1.0  
**Last Updated**: 2024  
**Compatible With**: AdminProducts v2.0+
