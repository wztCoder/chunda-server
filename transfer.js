const shoesData = require('./chunda.shoes.js');
const fs = require('fs');
function transformSizes(data) {
  return data.map(item => {
    // Split the size string by either '.' or '，' (Chinese comma)
    const sizes = item.size.split(/[.,，]/)
      .filter(size => size.trim() !== '') // Remove empty entries
      .map(size => ({
        shoeId: item._id.$oid, // Use the _id value
        stock: 1, // Assuming each size has 1 stock by default
        location: '', // Use the location from the item
        size: size.trim()
      }));
    
    return {
      ...item,
      sizes: sizes
    };
  });
}
const transformedData = transformSizes(shoesData);
fs.writeFileSync('transformed_shoes.json', JSON.stringify(transformedData, null, 2));
console.log(transformedData);