PMS-Server

INSTALL
git clone https://mamunur8819@bitbucket.org/webadnan/pms-server.git
# the url will be user specific, for Adnan it will be https://webadnan@bitbucket.org/webadnan/pms-server.git
cd pms-server
npm install gulp -g
npm install babel -g
npm install
# now set connection-string.xml with correct ip address of sql server
gulp watch-dev --relaod-server


SERVER
To get all APIs of server browse following link:
http://localhost:4000/api/batch/help
