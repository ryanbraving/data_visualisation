# Data Visualisation
This is a visualisation app developed completely on MeteorJS.
App has been deployed on Heroku and is accessible in here:
https://ryanbraving-datavisual.herokuapp.com/

To display collected data, from drop down menu choose an item and then click on "blobs" or "timeline"

MongoDB is the database and for visualisation features Vis JavaScript library has been used. App has been deployed on Heroku.
On the deployed version, the MangoDB Atlas is used which is hosted on AWS free tier. 


## Installed packages during developments:

`meteor add session twbs:bootstrap@=3.3.2` <br/>

Along with above command you might need to use this flag for compatibility: `--allow-incompatible-update` <br/>


## Getting this repo and running local server
#### Clone

`git clone git@github.com:ryanbraving/data_visualisation.git` <br/>



#### Install dependancies
`cd data_visualisation` <br/>
`meteor npm install` <br/>

#### Run server
`meteor` <br/>

Open your browser and hit `localserver:3000`
