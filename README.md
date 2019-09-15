# Handyman
### What is Handyman ?
A platform for all the small-scale vendors, housewives and any other skilled people who are not getting enough time to showcase their skills due to many different reasons like less market knowledge, less awareness of how to target the customers, and because of large-scale companies who have acquired the market. Our platform will help such skilled people to expand their businesses under their brand name and customers can afford their services at a reasonable cost. 

Tools: HTML 5, CSS 3, Bootstrap 4, JavaScript, Express.js, Node.js, MongoDB, Passport.js, Android, Java

## SETUP
<pre>
1. Download the project. (Zip or Clone). Unzip it.
2. Make an account on CLOUDINARY (https://cloudinary.com/)
   Get the API Key and API Secret
   In .env file which is at the same level of app.js file, make updates as below for handyman-web and handyman-admin
   CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
   CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
3. Inorder to make Forgot Password module work, you need to create a new email id or use any existing.
   Then for handyman-admin and handyman-web, under
   routes > admin.js
   routes > customer.js
   routes > vendor.js
   Change all "YOUR_EMAIL_ID" to the email id you created/ had in advance [existing].
4. You need to have Node, MongoDB installed to run the application
5. After that, install all the necessary dependencies which are listed below for handyman-web and handyman-admin.
   Check out NPM BASIC COMMANDS
</pre>

## NPM BASIC COMMANDS
http://dreamerslab.com/blog/en/npm-basic-commands/ <br/>
https://codeburst.io/getting-started-with-node-js-a-beginners-guide-b03e25bca71b

## handyman-admin > package.json
<pre>
{
  "name": "handyman-admin",
  "version": "1.0.0",
  "description": "Handyman Admin Panel",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Dhrumil Amish Shah",
  "license": "ISC",
  "dependencies": {
    "async": "^2.6.1",
    "body-parser": "^1.18.3",
    "cloudinary": "^1.13.2",
    "connect-flash": "^0.1.1",
    "dotenv": "^6.2.0",
    "ejs": "^2.6.1",
    "express": "^4.16.4",
    "express-session": "^1.15.6",
    "express-validator": "^5.3.1",
    "method-override": "^3.0.0",
    "mongoose": "^5.4.7",
    "multer": "^1.4.1",
    "nodemailer": "^5.1.1",
    "passport": "^0.4.0",
    "passport-local": "^1.0.0",
    "passport-local-mongoose": "^5.0.1"
  }
}
</pre>


## handyman-web > package.json
<pre>
{
  "name": "handyman-web",
  "version": "1.0.0",
  "description": "Handyman Web Application",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Dhrumil Amish Shah",
  "license": "ISC",
  "dependencies": {
    "async": "^2.6.1",
    "body-parser": "^1.18.3",
    "cloudinary": "^1.13.2",
    "connect-flash": "^0.1.1",
    "dotenv": "^6.2.0",
    "ejs": "^2.6.1",
    "express": "^4.16.4",
    "express-session": "^1.15.6",
    "express-validator": "^5.3.1",
    "method-override": "^3.0.0",
    "mongoose": "^5.4.7",
    "multer": "^1.4.1",
    "nodemailer": "^5.1.1",
    "passport": "^0.4.0",
    "passport-local": "^1.0.0",
    "passport-local-mongoose": "^5.0.1"
  }
}
</pre>

## MVC

MVC is an acronym for Model-View-Controller.

**Model:** Model represents the structure of data, the format and the constraints with which it is stored. It maintains the data of the application. Essentially, it is the database part of the application.

**View:** View is what is presented to the user. Views utilize the Model and present data in a form in which the user wants. A user can also be allowed to make changes to the data presented to the user. They consist of static and dynamic pages which are rendered or sent to the user when the user requests them.

**Controller:** Controller controls the requests of the user and then generates appropriate response which is fed to the viewer. Typically, the user interacts with the View, which in turn generates the appropriate request, this request will be handled by a controller. The controller renders the appropriate view with the model data as a response.

So, to sum it up:

Model is data part.<br/>
View is User Interface part.<br/>
Controller is request-response handler.<br/>

As you can see, there is a **routes** folder, which will serve as **controllers**.<br/>
Then there is a **models** folder, in which we have a different models.<br/>
A **views** folder, which have our views with an extension of ejs. Be noted that ejs is a templating engine which means that it has the ability to generate the pages by filling in the templating that we create.<br/>
A **middleware** folder, which have our middlewares for authentication and to check comment ownership.<br/>

## Folder: handyman-web
This website is for customers and vendors. They both can register through registration path
I made this to run on port 3000. You can change the port number if you want to.
It can be changed in ".env" file.
Some operations which can be performed are...

### For customers:-
1.  Login as customer
2.  Register as customer
3.  Forgot password for customer
4.  View all services
5.  View all subservices
6.  View all vendors
7.  View individual vendor for more details.
8.  Rate vendor [In Progress]
9.  Comment on vendor
10. View all comments by different customers
11. Edit customer profile

### For vendors:-
1.  Login as vendor
2.  Register as vendor
3.  Forgot password for vendor
4.  View all services
5.  View all subservices
6.  View all vendors
7.  View individual vendor for more details.
8.  View all comments by different customers
9.  Edit vendor profile
10. View own profile



## Folder:- handyman-admin
This website is for admins.
I made this to run on port 3001.You can change the port number if you want to.
It can be changed in ".env" file. 
Some operations which can be performed are...
1. View all customers
2. View all vendors
3. Edit/Delete customer(s)
4. Edit/Delete vendor(s)
5. Approve vendor(s)
6. Edit/Delete comment(s) 
7. Forgot Passoword
8. Login 
9. Edit Admin Profile can be performed.

## Folder:- handymanapp
Since I have made the application fully responsive, it can work on any device size. 
Android application which uses WebView component and some tweaks.
You can use tools like ngrok (https://ngrok.com/)
Just type one command for, secure URL to your localhost server through any NAT or firewall.
Just use command [ngrok http 3000] and then use the URL which is generated and replace the "YOUR_HANDYMAN_URL" in MainActivity.java

## Folder:- handyman-website-images
Images of handyman website. Check out this folder to see different images of website.

## Folder:- handyman-app-video
Working video of handyman android application.
