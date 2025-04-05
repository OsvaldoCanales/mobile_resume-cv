

ADMIN CREDENTIALS: 
Username: admin
Password: secret


Steps to meet the rubric: 


GET Endpoint 
--------------
Even with no credentials entered click "All todos". 
This will return a 404 because there are no todos added. You can enter in as admin, add a task, then remove credentials to see that it returns "everything" without authenticatio


POST,PUT, DELETE Basic Auth
-----------------------------
When you try and add a task, update a task, or delete a task without credentials, you get a a 401. NOTE: It might look like it got removed but that is just the front end. The back end still keeps it. Click on "All todos" and it will appear again. I need to handle the front end to not do that, work in progress! 

POST,PUT, DELETE Basic Auth 2 
-----------------------------
When you try and add a task, update a task, or delete a task with INVALID credentials you get a 401. 

POST, PUT, DELETE Authorized for "Things"
------------------------------------------
If you have admin or author credentials and you try and post, update, or delete a task it will let you and respond with a 200 code. 


Admin Section
---------------
You must have admin credentials entered first, then click "View Users" to see all users. This will get all users, then you can update or delete users. If you want to create users then enter in the "create new user" section above. You must have admin credentials still entered. 

Users Authenticated
--------------------
In order to do the following get, create, update, or delete users from 'admin section' you MUST have admin credentials entered. 

Admin versus User
------------------
Only admin credentials work to modify other user accounts. You can try and add a user and using those credentials and click 'View Users' you will get a 403 error. 


