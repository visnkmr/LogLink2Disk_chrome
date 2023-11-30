<!-- The extensions sends a put request to ipaddress_of_savetodisk:port. 
The savetodisk will insert this url, title and time of logging to a file/db on its disk. 
The savetodisk and this extension can run on separate machines. -->

Build the extension locally:
- Clone the repo
- bun i
- bun webpack
- load extension folder into chrome unpacked