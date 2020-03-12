var mysql = require('mysql');
var inquirer = require('Inquirer');
// start the connection
var connection = mysql.createConnection({
    host:"localhost",
    port:3306,
    user:"root",
    password:"root",
    database:"bamazon"
})

// initilize connection

connection.connect(function(err){
    if (err) throw err;
    // then test the connection to make sure it works & is established.
    console.log("connection succesful!");
    // make a make table function that collects all the data we need from the mysql database to print it to the screen
    makeTable();

})

var makeTable = function(){
    connection.query("SELECT * FROM products", function(err,res){
        for(var i=0; i<res.length; i++){
            console.log(res[i].itemID+" || "+res[i].productname+" || "+ 
            res[i].departmentName+" || "+res[i].price+" || "+res[i].stockquantity+"\n")
                    // following this, run node bamazon.js again to see if the connection is succesful
                    // the next portion will be used for allowing a user to select one of the options and purchase them from there
        
        
        }
        promptCustomer(res);
        
    })
}
// taking in a respose prop from the connection query becasue itll make all of the options and products will allow them to be all the options the user can select from
var promptCustomer = function(res){
        inquirer.prompt([{
            type:'input',
            name:'choice',
            message:"What would you like to purchase? [Quit with Q]"

        }]).then(function(answer){
            var correct = false;
          // the next bit of code will the the portion that says "user quit with Q", to get that actually working.
            if(answer.choice.toUpperCase()=="Q"){
                process.exit();
            }
            for(var i=0;i<res.length;i++){
                if(res[i].productname==answer.choice){
                    correct=true;
                    var product=answer.choice;
                    var id=i;
                    // this last code is used for creating a inquirer propmt for the user to determine which they would like to purchase. they would type in the product name then loop through the respionse from the query above. If the name is equal to the string they inputted then its going to say that correct = truw. itll set the product variable to every choice they make thenset the id to every id it was. 
                    // next  ask them another unquire prompt to see how many of the items they would like to buy
                    inquirer.prompt({
                        type:"input",
                        name:"quant",
                        message:"How many would you like to buy?",
                        validate: function(value){
                            if(isNaN(value)==false){
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }).then(function(answer){
                        if((res[id].stockquantity-answer.quant)>0){
                            connection.query("UPDATE products SETstockquantity= "+(res[id].stockquantity-answer.quant)+" WHERE productname="+product + "", function(err,res2){
                                console.log("Product Bought!");
                                makeTable();

                            })
                        }
                        else {
                            console.log("Not a valid selection!");
                            promptCustomer(res);
                            // above, that section was used for propmting the user for how much of an item they would like to buy then checking that its a number. if that number isnt greater than the current stock quantity, then itll purchase that item and set that item's quantity on the database down to what it should be.. 
                            // should be ran by node bamazom.js
                        }
                    })
                }
            }
            // this allows the user to enter q and itoll quit out the application. also if the user enters a product that doesnt exist in the database, then itll tell them its not a valid selection then rerun the prompt again.
            if(i==res.length && correct == false){
                console.log("Not a valid selection!");
                promptCustomer(res);
            }
        })

}