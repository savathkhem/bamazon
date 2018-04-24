var mysql = require("mysql");
var inquirer = require("inquirer");
// var chosenItem;
// var amountPurchased;

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazonDB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  initialize();
});

// function which prompts the user for what action they should take
function initialize() {
  inquirer
    .prompt({
      name: "actionmenu",
      type: "list",
      message: "[POST] to add a product.. [BUY] to buy a product... [MANAGE] to manage products... [EXIT] to GET OUT!",
      choices: ["POST", "BUY", "MANAGE", "EXIT"]
    })
    .then(function(answer) {
    switch (answer.actionmenu) {
      case "POST":
        post();
        break;

      case "BUY":
        buy();
        break;

      case "MANAGE":
        manager();
        break;

      case "EXIT":
        connection.end();
        break;
      }
    })
};

// function to handle posting new products
function post() {
  inquirer
    .prompt([
      {
        name: "product",
        type: "input",
        message: "Give your product a name..."
      },
      {
        name: "description",
        type: "input",
        message: "Describe your product..."
      },
      {
        name: "price",
        type: "input",
        message: "Give your product a sales price...",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
          name: "quantity",
          type: "input",
          message: "Tell us how many products your want to post.."
      }
    ])
    .then(function(answer) {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.product,
          description: answer.description,
          price: answer.price,
          stock_quantity: answer.quantity
        },
        function(err) {
          if (err) throw err;
          console.log("Product succesfully added!");
          // RETURN TO MAIN MENU
          initialize();
        }
      );
    });
}

function buy() {
  //QUERY THE DB FOR ALL ITEMS FOR SALE
  connection.query("SELECT * FROM products WHERE stock_quantity > 0;", function(err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "choice",
          type: "list",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name + ", Price: $" + results[i].price  + ", Stock: " + results[i].stock_quantity);
            }
            return choiceArray;
          },
          message: "Take a look at our wares!  You won't be dissapointed!"
        },
        {
          name: "amount",
          type: "input",
          message: "How many would you like to buy?"
        }
      ])
      .then(function(answer) {
        // GET THE INFORMATION OF CHOSEN ITEM
        // AS EXAMPLE ANSWER.CHOICE MIGHT BE "Gum, Price: $20, Stock: 5"
        var chosenItem = answer.choice.split(",")[0];
        var amountPurchased = parseInt(answer.amount);
        var currentStock = parseInt(answer.choice.split(",")[2].slice(8));
        purchase(chosenItem, amountPurchased, currentStock);
        });
    });
}

function purchase(chosenItem, amountPurchased, currentStock) {
  // console.log(chosenItem)
  // console.log(amountPurchased)
connection.query(
    "UPDATE products SET ? WHERE ?",
    [
        {
            stock_quantity: (currentStock - amountPurchased),
        },
        {
            product_name: chosenItem
        }
    ],
    function(err) {
        if (err) throw err;
        console.log("Congratulations on your new purchase!");
        initialize();
    })
};

function manager() {
  inquirer
    .prompt({
      name: "managerMenu",
      type: "list",
      message: "[\n\n--------------------------------------------------------MANAGER MENU------------------------------------------------------\n|    INVENTORY] to view products for sale.. [RESTOCK] to restock a product... [ADD] to add new products... [RETURN] to return to the main menu!   |\n-----------------------------------------------------------------------------------------------------------------------------",
      choices: ["INVENTORY", "RESTOCK", "ADD", "RETURN"]
    })
    .then(function(answer) {
    switch (answer.managerMenu) {
      case "INVENTORY":
        inventory();
        break;

      case "RESTOCK":
        restock();
        break;

      case "ADD":
        post();
        break;

      case "RETURN":
        initialize();
        break;
      }
    })
  };



  function inventory() {
    var query = "SELECT * FROM products";
    connection.query(query, function(err, results) {
      for (var i = 0; i < results.length; i++) {
        console.log(results[i].product_name + ", Price: $" + results[i].price  + ", Stock: " + results[i].stock_quantity);
      }
      manager();
    });
  }

  function restock() {
    //QUERY THE DB FOR ALL ITEMS FOR SALE
    connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "choice",
            type: "list",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].product_name + ", Price: $" + results[i].price  + ", Stock: " + results[i].stock_quantity);
              }
              return choiceArray;
            },
            message: "Take a look at our wares!  Select the item you'd like to restock!"
          },
          {
            name: "amount",
            type: "input",
            message: "How many would you like to restock?"
          }
        ])
        .then(function(answer) {
          // GET THE INFORMATION OF CHOSEN ITEM
          // AS EXAMPLE ANSWER.CHOICE MIGHT BE "Gum, Price: $20, Stock: 5"
          var chosenItem = answer.choice.split(",")[0];
          var amountPurchased = parseInt(answer.amount);
          var currentStock = parseInt(answer.choice.split(",")[2].slice(8));
          restocker(chosenItem, amountPurchased, currentStock);
          });
      });
  }
  
  function restocker(chosenItem, amountPurchased, currentStock) {
    // console.log(chosenItem)
    // console.log(amountPurchased)
  connection.query(
      "UPDATE products SET ? WHERE ?",
      [
          {
              stock_quantity: (currentStock + amountPurchased),
          },
          {
              product_name: chosenItem
          }
      ],
      function(err) {
          if (err) throw err;
          console.log("Congratulations adding more stock to the inventory!");
          initialize();
      })
  };