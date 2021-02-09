<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Readonly.aspx.cs" Inherits="EPiServer.Util.Readonly" %>
<%@ Import Namespace="System.Threading" %>
<%@ OutputCache Location="None" %>
<!DOCTYPE html>
<html>
    <head id="Head1" runat="server">
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title id="Title1" runat="server" />
        <link rel="shortcut icon" href="~/util/images/favicon.ico" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex,nofollow" />
        <link type="text/css" rel="stylesheet" href="styles/login.css" />
    </head>
    <body>
        <div class="top-bar"><img src="images/episerver-white.svg" alt="logo" class="logo" /></div>
        <div class="js-login-wrapper login-wrapper" id="LoginControl">
            <div class="modal">
                <ol class="clearfix">
                    <li><img src="images/login/DXC_long.svg" alt="logo" class="logo" /></li>
                    <li>
                        <h3 class="text--error">
                            <asp:Literal runat="server" ID="modalTitle" Text="<%$ Resources: EPiServer, readonly.title %>" />
                        </h3>
                    </li>
                    <li>
                        <p>
                            <asp:Literal runat="server" ID="modalMessage" Text="<%$ Resources: EPiServer, readonly.message %>" />
                        </p>
                    </li>
                </ol>
            </div>
        </div>
        <script>
            var classes = [' img1', ' img2', ' img3'];
            document.getElementById("LoginControl").className += classes[Math.floor(Math.random() * classes.length)]

            function toggleCookieText() {
                document.getElementById("cookieInfoPanel").classList.toggle("is-visible");
                return false;
            }
        </script>
    </body>
</html>
