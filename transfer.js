const shoesData = require('./shoes');
let idCounter = 1;
const fs = require('fs');
function transformSizes(data) {
  return data.flatMap(item => {
    // Split the size string by either '.' or '，' (Chinese comma)
    return item.size.split(/[.,，]/)
      .filter(size => size.trim() !== '') // Remove empty entries
      .map(size => ({
        _id: idCounter++, // Use the _id value
        shoeId: item.id,
        stock: 1, // Assuming each size has 1 stock by default
        location: '', // Use the location from the item
        size: size.trim(),
        __v: 0
      }));
  });
}
const transformedData = transformSizes(shoesData);
fs.writeFileSync('transformed_shoes.json', JSON.stringify(transformedData, null, 2));
console.log(transformedData);