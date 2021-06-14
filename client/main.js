import '/lib/collection.js';
import './main.html';
import './main.js';
// this collection contains all the songs
// Songs = new Mongo.Collection("songs");
// this variable will store the visualisation so we can delete it when we need to 
var visjsobj;
if (Meteor.isClient){

////////////////////////////
///// helper functions for the vis control form
////////////////////////////

  Template.song_viz_controls.helpers({
    // returns an array of the names of all features of the requested type
    get_feature_names : function(type){
      var feat_field;
      if (type == "single"){
        feat_field = "single_features";
      }
      // pull an example song from the database
      // - I use this to find the names of all the single features
      song = Songs.findOne();
      if (song != undefined){// looks good! 
        // get an array of all the song feature names 
        // (an array of strings)
        features = Object.keys(song[feat_field]);
        features_a = new Array();
        // create a new array containing
        // objects that I can send to the template
        // since I can't send an array of strings to the template
        for (var i=0;i<features.length;i++){
            features_a[i] = {name:features[i]};
        }
        return features_a;
      }
      else {// no song available, return an empty array for politeness
        return [];
      }
    },
  });

////////////////////////////
///// helper functions for the feature list display template
////// (provide the data for that list of songs)
////////////////////////////

// helper that provides an array of feature_values
// for all songs of the currently selected type
// this is used to feed the template that displays the big list of 
// numbers
  Template.song_feature_list.helpers({
    "get_all_feature_values":function(){
      if (Session.get("feature") != undefined){  
        var songs = Songs.find({});
        var features = new Array();
        var ind = 0;
        // build an array of data on the fly for the 
        // template consisting of 'feature' objects
        // describing the song and the value it has for this particular feature
        songs.forEach(function(song){
            features[ind] = {
              artist:song.metadata.tags.artist,
              title:song.metadata.tags.title, 
              value:song[Session.get("feature")["type"]][Session.get("feature")["name"]],
              id:song._id,
            };
            ind ++;
        })
        return features;
      }
      else {
        return [];
      }
    },

  })

////////////////////////////
///// event handlers for the viz control form
////////////////////////////

  Template.song_viz_controls.events({
    // event handler for when user changes the selected
    // option in the drop down list
    "change .js-select-single-feature":function(event){
      event.preventDefault();
      var feature = $(event.target).val();
      Session.set("feature", {name:feature, type:"single_features"});
    }, 
    // event handler for when the user clicks on the 
    // blobs button
     "click .js-show-blobs":function(event){
      event.preventDefault();
      initBlobVis();
    }, 
    // event handler for when the user clicks on the 
    // timeline button
     "click .js-show-timeline":function(event){
      event.preventDefault();
      initDateVis();
    }, 

  }); 

  Template.song_feature_list.events({
    "click .js-selectLink":function(event){
      event.preventDefault();
      updateVisObject(event.currentTarget.id, 'click');
    }, 

    "mouseover .js-selectLink":function(event){
      // event.preventDefault();
      updateVisObject(event.currentTarget.id, 'mouseover');
    }, 

    "mouseout .js-selectLink":function(event){
      // event.preventDefault();
      updateVisObject(event.currentTarget.id, 'mouseout');
    }, 


  }); 

}


////////////////////////////
///// functions that set up and display the visualisation
////////////////////////////


// function that creates a new timeline visualisation
function initDateVis(){
  // clear out the old visualisation if needed
  if (visjsobj != undefined){
    visjsobj.destroy();
  }
  var songs = Songs.find({});
  var ind = 0;
  // generate an array of items
  // from the songs collection
  // where each item describes a song plus the currently selected
  // feature
  var items = new Array();
  // iterate the songs collection, converting each song into a simple
  // object that the visualiser understands
  songs.forEach(function(song){
    if (song.metadata.tags.date != undefined && //as long as something is in the array...
      song.metadata.tags.date[0] != undefined ){//and as long as it contains a date ...
      var label = "ind: "+ind; // then I generate a label for it.
      if (song.metadata.tags.title != undefined){// as long as I have a title
        label = song.metadata.tags.artist[0] + " - " + 
        song.metadata.tags.title[0];
      } 
      var value = song[Session.get("feature")["type"]][Session.get("feature")["name"]];
      var date = song.metadata.tags.date[0] + "-01-01";
      // here I create the actual object for the visualiser
      // and put it into the items array
      items[ind] = {
        x: date, 
        y: value, 
        // slighlty hacky label -- check out the vis-label
        // class in song_data_viz.css 
        label:{content:label, className:'vis-label', xOffset:-5}, 
      };
      ind ++ ;
  }
  });
  // set up the data plotter
  var options = {
    style:'bar', 
  };
  // get the div from the DOM that we are going to 
  // put our graph into 
  var container = document.getElementById('visjs');
  // create the graph
  visjsobj = new vis.Graph2d(container, items, options);
  // tell the graph to set up its axes so all data points are shown
  visjsobj.fit();
}

// function that creates a new blobby visualisation
function initBlobVis(){
  // clear out the old visualisation if needed
  if (visjsobj != undefined){
    visjsobj.destroy();
  }
  // find all songs from the Songs collection
  var songs = Songs.find({});
  var nodesData = new Array();

  var ind = 0;
  // iterate the songs, converting each song into 
  // a node object that the visualiser can understand
    songs.forEach(function(song){
      console.log(song)
      // set up a label with the song title and artist
     var label = "ind: "+ind;
     if (song.metadata.tags.title != undefined){// I have a title
          label = song.metadata.tags.artist[0] + " - " + 
          song.metadata.tags.title[0];
      } 
      // figure out the value of this feature for this song
      var value = song[Session.get("feature")["type"]][Session.get("feature")["name"]];
      // create the node and store it to the nodes array
        

        nodesData[ind] = {
          id:ind, 
          label:label, 
          value:value,
          songId: song._id,
          nodeColorBlocked:false,
        };
        ind ++;
    })

    nodes = new vis.DataSet(nodesData);
        // edges are used to connect nodes together. 
    // we don't need these for now...
    edges =[
    ];
    // this data will be used to create the visualisation
    var data = {
      nodes: nodes,
      edges: edges,
    };
    var color = {
      border:'black',
      background: 'green',
    }
    // options for the visualisation
     var options = {
      hover: true,
      chosen:true,
      // selectable: false,
      nodes: {
        shape: 'dot',
        color: color,
      }

    };
    // get the div from the dom that I'll put the visualisation into
    container = document.getElementById('visjs');
    // create the visualisation
    visjsobj = new vis.Network(container, data, options);

    visjsobj.on('hoverNode', function (properties) {
      var nodeId = properties['node'];
      if (nodeId){
        var selectedNode = nodes.get(nodeId);
        var songId = selectedNode.songId;
        if (!selectedNode.nodeColorBlocked) {
            selectedNode.color = {
              border: 'black',
              background: 'red',
            };
            nodes.update(selectedNode);
            $("#"+songId).css('color', 'red');
        }//if
      } //if
    }); //visjsobj.on('hoverNode')

    visjsobj.on('blurNode', function (properties) {
      var nodeId = properties['node'];
      if (nodeId){
        var selectedNode = nodes.get(nodeId);
        var songId = selectedNode.songId;
        if (!selectedNode.nodeColorBlocked) {
            selectedNode.color = {
              border: 'black',
              background: 'green',
            };
            nodes.update(selectedNode);
            $("#"+songId).css('color', 'black');
        }//if
      } //if
    }); //visjsobj.on('blurNode')

    visjsobj.on('select', function (properties) {
      var nodeId = properties['nodes']['0'];
      if (nodeId){
        var selectedNode = nodes.get(nodeId);
        var songId = selectedNode.songId;
        if (!selectedNode.nodeColorBlocked) {
          selectedNode.color = {
            border: 'black',
            background: 'black',
          };
          $("#"+songId).css({'font-weight':'bold','color':'black'});
        }
        else{
          selectedNode.color = {
            border: 'black',
            background: 'green',
          };
          $("#"+songId).css({'font-weight':'normal','color':'black'});
        }
        
        selectedNode.nodeColorBlocked = !selectedNode.nodeColorBlocked;
        nodes.update(selectedNode);
      } // if
    }); //visjsobj.on('select')

}

function updateVisObject(id, mouseAction){
  if (visjsobj){
    var selectedNode = findNodeFromSongId(id);
    var songId = selectedNode.songId;
    if (selectedNode && mouseAction == 'click'){
        if (!selectedNode.nodeColorBlocked) {
            selectedNode.color = {
              border: 'black',
              background: 'black',
            }; //color
            $("#"+songId).css({'font-weight':'bold','color':'black'});
        } //if
        else{
            selectedNode.color = {
              border: 'black',
              background: 'green',
            }; //color
            $("#"+songId).css({'font-weight':'normal','color':'black'});
        } //else
        selectedNode.nodeColorBlocked = !selectedNode.nodeColorBlocked;
    } // if
    else if (selectedNode && mouseAction == 'mouseover' && !selectedNode.nodeColorBlocked){
        selectedNode.color = {
          border: 'black',
          background: 'red',
        }; //color
    } //elseif
    else if (selectedNode && mouseAction == 'mouseout' && !selectedNode.nodeColorBlocked){
        selectedNode.color = {
          border: 'black',
          background: 'green',
        }; //color
    } //elseif
    nodes.update(selectedNode);

  }// if visjsobj
  else{
      console.log("blobs graphs has not been selected yet!");
  }
}// function

function findNodeFromSongId(id){
    var allNodesData = visjsobj.nodesData._data;
    var songId_a = new Array();
    var nodesNo = Object.keys(allNodesData);
    for (var i=0;i<nodesNo.length;i++){
        songId_a[i] = allNodesData[i].songId;
    }//for
    var nodeId = songId_a.indexOf(id);
    if(nodeId >= 0){
      var selectedNode = allNodesData[nodeId];
      return selectedNode;
    }
    return undefined;
}


