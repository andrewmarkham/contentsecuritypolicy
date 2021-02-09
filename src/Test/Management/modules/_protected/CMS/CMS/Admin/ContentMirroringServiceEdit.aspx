<%@ Page Language="c#" Codebehind="ContentMirroringServiceEdit.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.ContentMirroringServiceEdit"  Title="ContentMirroringInfo" %>
 
<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">

     <script type="text/javascript">

        var StartUpdatingTxt = "Start updating";
        var StopUpdatingTxt = "Stop updating";
        function ShowHideLog(divObject) {
            divObject.children[1].style.display = (divObject.children[1].style.display === 'block') ? 'none' : 'block';
            if($(".logMessage:visible").length > 0){
                MirroringUpdating.Stop();
            } else {
                MirroringUpdating.Start();
            }
        }

        var settingsTabId = '<%= settingTab.ClientID %>';
        var messageTabId = '<%= messageTab.ClientID %>';
        var monitoringTabId = '<%= monitoringTab.ClientID %>';
 
        $(document).ready(function(e) {
            $(".epi-tabView-navigation-item").click(function(e) {
                if (this.id === messageTabId) {
                    MirroringUpdating.Start('messageTab', 10000);
                } else if (this.id === monitoringTabId) {
                    MirroringUpdating.Start('monitoringTab', 10000);
                } else {
                    MirroringUpdating.Stop()
                }
            });

        });


        MirroringUpdating = function() {
        var publicMethods = {
        };
        
        var _activeTab = "";
        var _timeOut = 500;
        var _inError = false;
        var _timeOutHandler = null;
        var _active = true;

        var _clearTimeout = function() {
            if (_timeOutHandler !== null) {
                clearTimeout(_timeOutHandler);
            }
        }

        var _setTimeout = function() {
            _timeOutHandler = setTimeout(publicMethods.FetcthData, _timeOut);
        }

        var _update = function(tag) {
            if (_active !== true) {
                return;
            }

            _clearTimeout();
            $.ajax(
                {
                    url: "ContentMirroringServiceEdit.aspx?refresh=true&channel=<%=ContextID%>&activetab=" + _activeTab,
                    type: "POST",
                    inData: {},
                    contentType: 'application/json',
                    success: function(data) {
                        if (_inError === true) {
                            $("#" + tag + " tbody:last").remove();
                            _inError = false;
                        }
                        var monitoringEvents = eval("(" + data + ")");
                        $("#" + tag + " tbody:last").remove();
                        $.each(monitoringEvents, function(i, field) {
                            if (field.Log !== '') {
                                $("#" + tag).append("<tr><td>" + field.Time + "</td><td>" + field.State + "</td><td><div onclick=ShowHideLog(this);> <img src='<%=this.GetImageThemeUrl("DateBrowser/rightarrow.gif")%>'/><div class='logMessage' style='display: none' > " + field.Log + "</div></div></td></tr>");
                            } else {
                                $("#" + tag).append("<tr><td>" + field.Time + "</td><td>" + field.State + "</td><td>" + field.Log + "</td></tr>");
                            }
                        });

                        _setTimeout();
                    },

                    error: function(xhr, err, e) {
                        var now = new Date();
                        $("#" + tag).append("<tr><td>" + now.toDateString() + "</td><td>" + err.toString() + " please refresh page to solve the problem</td><td>" + xhr.responseText + "</td></tr>");
                        _inError = true;
                    }
                });

            return;
        }

        publicMethods.Start = function(activeTab, timeout) {
            if(timeout){
                _timeOut = timeout;
            }
            if(activeTab){
                _activeTab = activeTab;
            }
            publicMethods.FetcthData();
        }

        publicMethods.Stop = function() {
            _clearTimeout();

        }
        
        publicMethods.FetcthData = function() {

            if (_activeTab === "monitoringTab") {
                _update("monitoringLog");
                return;
            }
            if (_activeTab === "messageTab") {
                _update("messageLog");
                return;
            }
            return false;
        };

        return publicMethods;
    } ();
    
    function CheckSaveBeforeValidate()
    {
        if (EPi.PageLeaveCheck.HasPageChanged())
        {
            return confirm('<asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.contentmirroringserviceedit.savebeforevalidatecheck %>" />');            
        }
        
        return true;
    }        

    </script>

	<EPiServerUI:TabStrip runat="server" id="actionTab"  GeneratesPostBack="False" TargetID="Panel1">
		<EPiServerUI:Tab Text="#tabmirroingsettings" runat="server" ID="settingTab" sticky="True"/>
		<EPiServerUI:Tab Text="#tabhistory" runat="server" ID="messageTab" sticky="True"/>
		<EPiServerUI:Tab Text="#monitoring" runat="server" ID="monitoringTab" sticky="True" />
	</EPiServerUI:TabStrip>


	<asp:Panel ID="Panel1" Runat="server">    
	 
        <asp:Panel ID="tabView" runat="server">
        <div class="epi-formArea epi-padding">
            <div class="epi-size15">
                <div>
                    <asp:Label runat="server" AssociatedControlID="Name" Translate="#name" />
                    <asp:TextBox MaxLength="100" ID="Name" runat="server" />
                    <asp:CustomValidator ID="RequiredNameCheck" runat="server" OnServerValidate="ValidateName" Text="*"/>
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="Params" Translate="#params" />
                    <asp:TextBox MaxLength="100" ID="Params" runat="server" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="UseDefaultEndpointAdress" Translate="#usedefaulturi" />
                    <asp:CheckBox runat="server" ID="UseDefaultEndpointAdress" OnCheckedChanged="OnUseDefaultEndpointAdressCheckedChanged" Checked="False" AutoPostBack="True" />
                    <EPiServerScript:ScriptDisablePageLeaveEvent ID="ScriptDisablePageLeaveEvent2" EventType="Click" EventTargetId="UseDefaultEndpointAdress" runat="server" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="Uri" Translate="#uri" />
                    <asp:TextBox MaxLength="100" ID="Uri" runat="server" />
                    <asp:CustomValidator ID="EndpointUriValidator" runat="server" OnServerValidate="ValidateEndpointUri" Text="*"/>
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="FromPageLink" Translate="#frompagelink" />
                    <EPiServer:InputPageReference ID="FromPageLink" DisableCurrentPageOption="true" runat="server" style="display: inline;" />
                    <asp:CustomValidator ID="FromPageLinkValidator" runat="server" OnServerValidate="ValidateFromPageLink" Text="*"/>
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="ToPageLink" Translate="#topagelink" />
                    <asp:TextBox MaxLength="100" ID="ToPageLink" runat="server" />
                    <asp:CustomValidator ID="ToPageLinkValidator" runat="server" OnServerValidate="ValidateToPageLink" Text="*"/>
                </div>
                <div class="epi-indent">
                    <asp:CheckBox runat="server" ID="IncludeRoot" />
                    <asp:Label runat="server" AssociatedControlID="IncludeRoot" Translate="#includeroot" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="RunAsAnonymousUser" Translate="#runasanonymoususer" />
                    <asp:CheckBox AutoPostBack="True" ID="RunAsAnonymousUser" Checked="True" OnCheckedChanged="RunAsAnonymousUserChanged" runat="server" />
                    <EPiServerScript:ScriptDisablePageLeaveEvent ID="ScriptDisablePageLeaveEvent1" EventType="Click" EventTargetId="RunAsAnonymousUser" runat="server" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="ImpersonateUserName" Translate="#impersonateusername" />
                    <asp:TextBox Enabled="False" MaxLength="100" ID="ImpersonateUserName" runat="server" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="SendMailMessage" Translate="#ReportToMailAddress" />
                    <asp:CheckBox runat="server" ID="SendMailMessage" Checked="False" OnCheckedChanged="OnSendMailMessageChanged" AutoPostBack="true" />
                    <EPiServerScript:ScriptDisablePageLeaveEvent ID="ScriptDisablePageLeaveEvent3" EventType="Click" EventTargetId="SendMailMessage" runat="server" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="MailAddress" Translate="#MailAddress" />
                    <asp:TextBox Enabled="False" MaxLength="100" ID="MailAddress" runat="server" />
                    <asp:CustomValidator ID="EmailAddressValidation" runat="server" OnServerValidate="ValidateEmailAddress" Text="*"/>
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="ContinueOnError" Translate="#ContinueOnError" />
                    <asp:CheckBox runat="server" ID="ContinueOnError" Checked="False" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="Enabled" Translate="#enabled" />
                    <asp:CheckBox runat="server" ID="Enabled" Checked="True" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="ValidateSystem" Translate="#validateSystem" />
                    <asp:CheckBox runat="server" ID="ValidateSystem" Checked="True" />
                </div>
            </div>
        </div>
        <div class="epi-buttonContainer">
            <EPiServerUI:ToolButton DisablePageLeaveCheck="true" ID="DeleteButton" OnClick="DeleteForm" runat="server" SkinID="Delete" Text="<%$ Resources: EPiServer, button.delete %>" ToolTip="<%$ Resources: EPiServer, button.delete %>" />
            <EPiServerUI:ToolButton DisablePageLeaveCheck="true" ID="SaveButton" OnClick="SaveForm" runat="server" SkinID="Save" Text="<%$ Resources: EPiServer, button.save %>" ToolTip="<%$ Resources: EPiServer, button.save %>" />
            <EPiServerUI:ToolButton ID="CancelButton" OnClick="CancelForm" runat="server" CausesValidation="false" SkinID="Cancel" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" />
			<EPiServerUI:ToolButton ID="ResetStateButton" OnClick="Reset" runat="server" SkinID="Check" Text="<%$ Resources: EPiServer, admin.contentmirroringview.reset %>" ToolTip="<%$ Resources: EPiServer, admin.contentmirroringview.reset %>" />
            <EPiServerUI:ToolButton ID="validateSystemBtn" DisablePageLeaveCheck="true" OnClientClick="return CheckSaveBeforeValidate();" OnClick="Validatesystem_Click" Enabled="false" runat="server" CausesValidation="false" SkinID="Check"  Text="<%$ Resources: EPiServer, admin.contentmirroringserviceedit.checksystem %>" ToolTip="<%$ Resources: EPiServer, admin.contentmirroringserviceedit.checksystem%>" />
        </div>
        <asp:Literal ID="notificationLbl"  Visible="false" runat="server" Text="<%$ Resources: EPiServer, admin.contentmirroringview.checksystemnotification %>"></asp:Literal>
        </asp:Panel>
        <asp:Panel ID="Log" Runat="server">
		    <div class="epi-padding">
    	        <table id="messageLog" class="epi-default">
			        <thead>
			            <tr>
			                <th>
			                  <EPiServer:Translate Text="#logdate" runat="server" ID="Translate15" />
			                </th>
			                <th>
			                  <EPiServer:Translate Text="#logstatus" runat="server" ID="Translate16" />
			                </th>
			                <th>
			                  <EPiServer:Translate Text="#logmessage" runat="server" ID="Translate17" />
			                </th>
			            </tr>
			        </thead>
			        <tbody >
    			        <tr>
	    		            <td>
		    		        </td >
		    		    </tr>
		            </tbody>
		        </table>
    	    </div>
		</asp:Panel>
	    <asp:Panel ID="generalmonitoring" Runat="server">
	        <div class="epi-padding">
	            <table id="monitoringLog" class="epi-default">
	                <thead>
	                      <tr>
	                        <th>
	                          <EPiServer:Translate Text="#logdate" runat="server" ID="Translate18" />
	                        </th>
	                        <th>
	                          <EPiServer:Translate Text="#logstatus" runat="server" ID="Translate19" />
	                        </th>
	                        <th>
	                          <EPiServer:Translate Text="#logmessage" runat="server" ID="Translate20" />
	                        </th>
	                    </tr>
	                </thead>
	                <tbody >
		                <tr>
		                    <td>
    		                </td>
    		            </tr>
                    </tbody>
                </table>
            </div>
        </asp:Panel>
        <asp:Panel  Visible="False" ID="resetPanel" runat="server" CssClass="epi-padding">
                <EPiServerUI:ToolButton ID="ContinueReset" OnClick="ContinueWithReset" runat="server"
                    SkinID="Check" Text="<%$ Resources: EPiServer, admin.contentmirroringview.continuereset %>"
                    ToolTip="<%$ Resources: EPiServer, admin.contentmirroringview.continuereset %>" /><EPiServerUI:ToolButton ID="CancelTheReset" OnClick="CancelReset" runat="server"
                    SkinID="Cancel" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" />
            </asp:Panel>
    
    </asp:Panel>

</asp:Content>

