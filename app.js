const express = require('express');
const request = require("request");
const uuidv4 = require('uuid/v4');
const app = express()

const CLIENT_ID = // put your tron·x client_id here
const CLIENT_SECRET = // put your tron·x client client_secret here
const REDIRECT_URI = //put your redirect url you have registerd with tron·x (dont forgot it to be full url with protocole)
const REDIRECT_URI_PATH = // path of redirect url


app.get('/', (req, res) => res.send(`
    <!doctype html>
    <html>
        <head>
    <link rel="icon" href="http://makitweb.com/wp-content/uploads/2016/02/cropped-sitelogo-32x32.png" sizes="32x32">
    <link rel="icon" href="http://makitweb.com/wp-content/uploads/2016/02/cropped-sitelogo-192x192.png" sizes="192x192">
    <link rel="apple-touch-icon-precomposed" href="http://makitweb.com/wp-content/uploads/2016/02/cropped-sitelogo-180x180.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Login with tron·x</title>
    <link href="style.css" rel="stylesheet" type="text/css">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.js" type="text/javascript"></script>

    <script type="text/javascript">
        $(document).ready(function(){
            $("#but_submit").click(function(){
                window.location.href = "https://oauth.smartron.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read";
            });
        });
    </script>
    </head>
    <body>
        <div class="container">
            <div id="div_login">
                <h1>Login with tron·X</h1>
                <div id="message"></div>
                <div>
                    <input type="button" value="login" name="but_submit" id="but_submit" />
                </div>
            </div>
        </div>
    </body>
</html>
`));

app.get(REDIRECT_URI_PATH, (req, res) => {
    let code = req.query && req.query.code;
    if (!code) return res.send("invalid login");
    var options = {
        method: 'POST',
        url: 'https://oauth.smartron.com/oauth/token',
        headers: {
            'Cache-Control': 'no-cache',
            'X-RequestId': uuidv4(),
            'Content-Type': 'application/json'
        },
        body: {
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) return res.send("invalid login");
        if (!body.user_id) res.send("invalid login");
        res.send(`
            <!doctype html>
            <html>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.js" type="text/javascript"></script>
                <script type="text/javascript">
                    $(document).ready(function(){
                        $("#but_submit").click(function(){
                            window.location.href = "/logout?user=${body.user_id}&session=${body.access_token}";
                        });
                    });
                </script>
                <p>Hi <b>${body.user_id}</b>,<br/>you have logged in with tron·X</p>
                <div>
                    <input type="button" value="logout" name="but_submit" id="but_submit" />
                </div>
            </html>
          `);
    });
});

app.get('/logout', (req, res)=>{
    let session = req.query.session;
    let user = req.query.user;
    var options = { method: 'POST',
        url: 'https://tcloud2.smartron.com/api/auth/logout',
        headers: {
            'Cache-Control': 'no-cache',
            'X-RequestId': uuidv4(),
            'X-ProtocolVersion': 'v2.0',
            'X-UserId': user,
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-DeviceId': 'NOSERIALNUMBER',
            'X-Authorization': session
        }
    };

    request(options, function (error, response, body) {
        if (error){
            console.log(error);
            return res.redirect('/');
        }
        return res.redirect('/');
    });
})



app.listen(7040, () => console.log('Example app listening on port 7040!'))
