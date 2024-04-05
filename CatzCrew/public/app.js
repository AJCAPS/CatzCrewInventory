let db;
document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    db = firebase.firestore();
    
    const ingredients = db.collection('ingredients');

    ingredients.get().then((querySnapshot) => {
        const data = [['Product', 'Quantity']];

        querySnapshot.forEach((doc) => {
            const productData = doc.data(); 
            data.push([productData.name, productData.quantity]);
        });

        google.charts.setOnLoadCallback(() => drawChart(data));
        updateTables();
    });
});
function drawChart(data) {
  const dataTable = google.visualization.arrayToDataTable(data);
  const options = {
      title: 'Product Quantities',
      titleTextStyle: {
          color: '#FFF'
      },
      colors: ['#BF5700'],
      backgroundColor: '#333333',
      hAxis: {
          textStyle: {
              color: '#FFF' 
          }
      },
      vAxis: {
          textStyle: {
              color: '#FFF' 
          }
      },
      legend: {
        textStyle: {
            color: '#FFF'
        }
    }
  };
  const chart = new google.visualization.BarChart(document.getElementById('myChart'));
  chart.draw(dataTable, options);
}

function addProduct() {
    // Get the input values
    const ingredientName = document.getElementById('ingredientName').value;
    const ingredientDescription = document.getElementById('ingredientDescription').value;
    const ingredientQuantity = document.getElementById('ingredientQuantity').value;

    // Get a reference to the count document
    const countDoc = db.collection('metadata').doc('ingredientCount');

    // Run a transaction to increment the count and add the new ingredient
    db.runTransaction((transaction) => {
        return transaction.get(countDoc).then((doc) => {
            if (!doc.exists) {
                throw "Document does not exist!";
            }

            // Compute the new ID
            const newID = doc.data().count + 1;

            // Increment the count in the count document
            transaction.update(countDoc, { count: newID });

            // Add the new ingredient with the new ID
            transaction.set(db.collection('ingredients').doc(newID.toString()), {
                id: newID,
                name: ingredientName,
                description: ingredientDescription,
                quantity: ingredientQuantity
            });
        });
    }).then(() => {
        console.log('Transaction successfully committed!');
    }).catch((error) => {
        console.error('Transaction failed: ', error);
    });
}
function updateTables() {
    let currentStockCost = 0;
    let outOfStockItems = [];
    db.collection('ingredients').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const cost = data.cost;
        const quantity = data.quantity;
        const lowstock = data.lowstock;
  
        // Calculate current stock cost
        currentStockCost += cost * quantity;
  
        // Check for out of stock items
        if (quantity <= lowstock) {
          outOfStockItems.push(doc.data().name);
        }
      });
          // Log the outOfStockItems array for debugging
    console.log('Out of stock items:', outOfStockItems);
  
      // Update the 'current stock cost' table
      document.getElementById('stockCostTable').innerHTML = `
        <table>
          <tr>
            <th>Current Stock Cost</th>
          </tr>
          <tr>
            <td>₱${currentStockCost.toFixed(2)}</td>
          </tr>
        </table>
      `;
  
      // Update the 'out of stock' items table
      const outOfStockTableHTML = outOfStockItems.map(item => `
        <tr>
          <td>${item}</td>
        </tr>
      `).join('');
  
      document.getElementById('outOfStockTable').innerHTML = `
        <table>
          <tr>
            <th>Low Stock Items</th>
          </tr>
          ${outOfStockTableHTML}
        </table>
      `;
    });
  }

