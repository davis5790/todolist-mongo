//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

// Schemas and Models

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Create 3 default items and store them in an array

const item1 = new Item ({
  name: "Buy Food"
});

const item2 = new Item ({
  name: "Cook Food"
});

const item3= new Item ({
  name: "Eat Food"
});

const defaultItems= [item1, item2, item3];





app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("success")
        };
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    };
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };

 
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  console.log(checkedItemID);
  console.log(listName)

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("success");
        res.redirect("/");
      }
    });
  } else {
    List.findOne({name:listName}, function(err, foundList){
      if (!err){
        //******ALTERNATE LINE FROM VIDEO ***************
        foundList.items.pull({ _id: checkedItemID }); 
        foundList.save();
        res.redirect("/" + listName);
      } else {
        console.log(err);
      };
    
    });
  };
});

app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, found){
    if (found) {
      res.render("list", {listTitle: found.name, newListItems: found.items});
    } else {
      console.log("creating list");
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
      res.redirect("/" + customListName);
    
      res.render("list", {listTitle: customListName, newListItems: list.items});
    };
 });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
