<%@ Page Language="c#" CodeBehind="EditPropertyDefinition.aspx.cs" AutoEventWireup="False"
    Inherits="EPiServer.UI.Admin.EditPropertyDefinition" 
    Title="EditPropertyDefinition" %>

<%@ Register TagPrefix="EPiServerUI" TagName="BreakingChangePrompt" Src="BreakingChangePrompt.ascx" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
    <script type='text/javascript'>
        //<![CDATA[
        var _currentTypeSelectedIndex = null;
        var pageHasChangedHandler = null;
        var pageHasChanged = false;
        
        $(document).ready(function() {
            var dropDown = getTypeDropdownObject();
            if (dropDown.length)
            {
                _currentTypeSelectedIndex = dropDown.get(0).selectedIndex;
                dropDown.change(onChange);
            }
            if ($.browser.msie) {
                // if IE, attach checkPageChanged() to the focusin event and check the pageHasChanged variable in the pageHasChangedHandler
                $("#<%= PropertyDefinitionType.ClientID %>").bind('focusin', function() { 
                    pageHasChanged = EPi.PageLeaveCheck.HasPageChanged(); 
                });
                pageHasChangedHandler = function() { return pageHasChanged; };
            } else {
                // else check EPi.PageLeaveCheck.HasPageChanged directly in the pageHasChangedHandler
                pageHasChangedHandler = function() { return EPi.PageLeaveCheck.HasPageChanged() };
            }
        });

        function ConfirmLanguageSpecific(checkboxNode)
        {		
	        if(<%= PropertyDefinitionData.LanguageSpecific ? "true" : "false" %> && !document.forms[0]['<%=LanguageSpecific.UniqueID%>'].checked)
	        {
		        var onCompleteArguments = checkboxNode;
		        if(<%= PropertyDefinitionData.IsDynamicProperty ? "true" : "false" %>)
		        {
			        EPi.CreateDialog("ConfirmLanguageSpecific.aspx?typeId=<%=PropertyDefinitionData.ID%>&isDynamic=true", OnConfirmDialogComplete, onCompleteArguments, null,{width: 590, height: 800});
			    }
			    else
			    {
		            EPi.CreateDialog("ConfirmLanguageSpecific.aspx?typeId=<%=PropertyDefinitionData.ID%>", OnConfirmDialogComplete, onCompleteArguments, null,{width: 590, height: 800});
			    }
			    return false;
			}
		}
	    
	    function OnConfirmDialogComplete(returnValue, onCompleteArguments)
	    {
            if (returnValue)
            {
	            onCompleteArguments.checked = false;
            }
        }
        
        function onChange() {
            //This function is for refreshing the page and sending a new parameter with the new selected value instead of
            //using autopostback to update which adapter to load. This is due to viewstate/control state issues that otherwise appear on postback.
            if (pageHasChangedHandler() && !confirm('<%= TranslateForScript("/admin/editpropertydefinition/changetypemessage") %>')) {
                //Set the value of the dropdown back to its old value since if we press cancel we don't want the value to change.
                getTypeDropdownObject().get(0).selectedIndex = _currentTypeSelectedIndex;
                return;
            }
            
            var rest, restindex,
                value = getTypeDropdownObject().val(),
                loc = document.location.search,
                ampIndex = loc.indexOf('&SelectedPlugin='),
                questIndex = loc.indexOf('?SelectedPlugin=');
           
            if (ampIndex > -1) {
                //Remove the old parameter by making the new query to whats before and after the parameter.
                loc = loc.substr(0, ampIndex) + getRestOfQuery(loc, ampIndex);
            } else if (questIndex > -1) {
                rest = getRestOfQuery(loc, questIndex);
                if (rest.length > 0) {
                    loc = "?" + rest.substring(1, rest.length); //remove the first & sign from the rest and add it after the ? in the query                
                } else {
                    //Since we did not have anything after the parameter location should just update with the new parameter value
                    document.location.href = getLocationBasePath() + "?SelectedPlugin=" + value;
                    return;
                }
            }
            
            //Try catch added since when the page is loaded in a new window/tab and you press cancel in the "page leave" confirm you get an exception even if the data is correct.
            //We want to just ignore this error and continue.        
            try{
                document.location.href = getLocationBasePath() + loc + "&SelectedPlugin=" + value;
            } catch(ex){}
        }

        function getRestOfQuery(loc, index) {
            //Searches the rest of the querystring for any parameters. (loc is the remaining querystring)
            var rest = loc.substr(index + 1, loc.length);
            var restindex = rest.indexOf("&");
            if (restindex > 0) {
                rest = rest.substring(restindex, rest.length);
            } else {
                rest = "";
            }
            return rest;
        }
        
        function getTypeDropdownObject() {
            return $("select", "#<%= PropertyDefinitionType.ClientID %>");
        }

        function getLocationBasePath() {
            //Creates the path for the current page (only before the ? if any such exists)
            var port = document.location.port;
            var host = document.location.hostname;
            if (port.length > 0) {
                host = host + ":" + port;
            }
            return document.location.protocol + "//" + host + document.location.pathname;
        }

        //]]>
    </script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <EPiServerUI:TabStrip runat="server" ID="actionTab" GeneratesPostBack="False" TargetID="TabView">
		<EPiServerUI:Tab Text="<%$ Resources: EPiServer, admin.editpropertydefinition.commonsettingstab %>" runat="server" ID="Tab1" sticky="True" />
		<EPiServerUI:Tab Text="<%$ Resources: EPiServer, admin.editpropertydefinition.customsettingstab %>" runat="server" ID="Tab2" sticky="True" />
    </EPiServerUI:TabStrip>

    <div class="epi-formArea epi-padding">
        <asp:Panel ID="TabView" runat="server">
            <asp:Panel runat="server">
                    <fieldset>
                        <legend><span><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.editpropertydefinition.generalsettingsheading %>" /></span></legend>
                        <dl>
                            <asp:PlaceHolder runat="server" Visible="<%# PropertyDefinitionData.ExistsOnModel %>">
                                <dt><%: Translate("/admin/editcontenttype/fromcode") %></dt>
                                <dd><%: Translate("/button/yes") %></dd>
                            </asp:PlaceHolder>
                            <dt><asp:Label ID="PropertyDefinitionTypeLabel" runat="server" AssociatedControlID="PropertyDefinitionType" Translate="#typecaption" /></dt>
                            <dd><EPiServer:InputPropertyDefinitionType ID="PropertyDefinitionType" runat="server" />
                                <asp:Label ID="PropertyDefinitionTypeLocked" runat="server" Visible="false"><%: PropertyDefinitionData.Type.LocalizedName %></asp:Label>
                                <span runat="server" id="PropertyDefinitionTypeValidation"></span>
                                <EPiServerScript:ScriptDisablePageLeaveEvent EventType="Change" EventTargetID="PropertyDefinitionType" runat="server" /></dd>
                            <dt><asp:Label ID="NameLabel" runat="server" AssociatedControlID="Name" Translate="#namecaption" /></dt>
                            <dd><asp:TextBox MaxLength="50" Size="50" ID="Name" CssClass="EP-requiredField" runat="server" />
                                <asp:Label ID="NameLocked" runat="server" Visible="false"><%: PropertyDefinitionData.Name %></asp:Label>
                                <asp:RequiredFieldValidator ID="NameRequiredValidator" ControlToValidate="Name" Text="*"
                                    EnableClientScript="false" runat="server" />
                                <asp:RegularExpressionValidator ValidationExpression="^[A-Za-z]+[\w-]*$" ID="ValidNameValidator"
                                    ControlToValidate="Name" Text="*" EnableClientScript="true" runat="server" /></dd>
                            <dt><asp:Label ID="SelectControlLabel" runat="server" AssociatedControlID="SelectControl" 
                                Text="<%$ Resources: EPiServer, admin.editpropertydefinition.selectuicontrollabel %>" /></dt>
                            <dd><asp:DropDownList runat="server" ID="SelectControl" DataTextField="Name" DataValueField="FullName" />
                                <asp:Label ID="SelectControlLocked" runat="server" Visible="false"><%: SelectControl.SelectedItem.Text %></asp:Label></dd>
                            <asp:PlaceHolder ID="PageTypeOnly" runat="server">
                                <dt><EPiServer:Translate ID="Translate2" Text="#defaultcaption" runat="server" /></dt>
                                <dd><input type="radio" id="RadioNoDefault" name="DefaultValueType" runat="server" />
                                    <asp:Label runat="server" AssociatedControlID="radioNoDefault" Translate="#nodefaultcaption" /><br />
                                    <input type="radio" id="RadioInherit" name="DefaultValueType" runat="server" />
                                    <asp:Label runat="server" AssociatedControlID="radioInherit" Translate="#inheritcaption" /><br />
                                    <input type="radio" id="RadioDefault" name="DefaultValueType" runat="server" />
                                    <asp:TextBox Size="50" ID="DefaultValue" runat="server" /></dd>
                                <dt></dt>
                                <dd><asp:CheckBox ID="Required" runat="server" />
                                    <asp:Label runat="server" AssociatedControlID="Required" Translate="#requiredcaption" /></dd>
                                <dt></dt>
                                <dd><asp:CheckBox ID="Searchable" runat="server" />
                                    <asp:Label runat="server" AssociatedControlID="Searchable" Translate="#searchablecaption" />
                                </dd>
                            </asp:PlaceHolder>
                            <dt></dt>
                            <dd><asp:CheckBox ID="LanguageSpecific" runat="server" />
                                <asp:Label runat="server" AssociatedControlID="LanguageSpecific" Translate="#languagespecificcaption" /></dd>
                        </dl>
                    </fieldset>
                    <fieldset>
                        <legend><span><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.editpropertydefinition.editorsettingsheading %>" /></span></legend>
                        <dl>
                            <dt></dt>
                            <dd><asp:CheckBox ID="DisplayEditUI" runat="server" />
                                <asp:Label runat="server" AssociatedControlID="DisplayEditUI" Translate="/admin/editpropertydefinition/displayeditui" /></dd>
                            <dt><asp:Label ID="EditCaptionLabel" runat="server" AssociatedControlID="EditCaption" Translate="#editcaption" /></dt>
                            <dd><asp:TextBox MaxLength="255" Size="50" ID="EditCaption" CssClass="EP-requiredField" runat="server" />
                                <asp:Label ID="EditCaptionLocked" runat="server" Visible="false"><%: PropertyDefinitionData.EditCaption %></asp:Label>
                                <asp:RequiredFieldValidator ID="EditCaptionRequiredValidator" ControlToValidate="EditCaption"
                                    Text="*" EnableClientScript="false" runat="server" /></dd>
                            <dt><asp:Label ID="HelpTextLabel" runat="server" AssociatedControlID="HelpText" Translate="#helpcaption" /></dt>
                            <dd><asp:TextBox MaxLength="2000" Size="50" ID="HelpText" runat="server" />
                                <asp:Label ID="HelpTextLocked" runat="server" Visible="false"><%: PropertyDefinitionData.HelpText %></asp:Label></dd>
                            <dt><asp:Label ID="AdvancedLabel" runat="server" AssociatedControlID="Advanced" Translate="#advancedcaption" /></dt>
                            <dd><EPiServer:InputTab ID="Advanced" runat="server" Style="display: inline;" />
                                <asp:Label ID="AdvancedLocked" runat="server" Visible="false"><%: PropertyDefinitionData.Tab != null ? PropertyDefinitionData.Tab.Name : String.Empty %></asp:Label></dd>
                            <dt><asp:Label ID="FieldOrderLabel" runat="server" AssociatedControlID="FieldOrder" Text="<%$ Resources: EPiServer, admin.editpagetypesettings.sortordercaption %>" /></dt>
                            <dd><asp:TextBox ID="FieldOrder" runat="server" MaxLength="11" SkinID="Size50"></asp:TextBox>
                                <asp:Label ID="FieldOrderLocked" runat="server" Visible="false"><%: PropertyDefinitionData.FieldOrder%></asp:Label>
                                <asp:RangeValidator ID="FieldOrderNumeric" MinimumValue="1" MaximumValue="2147483647"
                                    Type="Integer" Text="*" ControlToValidate="FieldOrder" runat="server" /></dd>
                        </dl>
                    </fieldset>
            </asp:Panel>
            <asp:Panel runat="server">
                <asp:Panel ID="PropertySettingsPanel" runat="server" CssClass="epi-paddingHorizontal-small epi-formArea"></asp:Panel>
            </asp:Panel>
        </asp:Panel>

        <div class="epi-buttonContainer">
            <EPiServerUI:BreakingChangePrompt runat="server" ID="BreakingChangePrompt" />
            <EPiServerUI:ToolButton ID="DeleteButton" ConfirmMessage='<%$ Resources: EPiServer, admin.editpropertydefinition.confirmdelete %>'
                runat="server" Text="<%$ Resources: EPiServer, button.delete %>" ToolTip="<%$ Resources: EPiServer, button.delete %>"
                SkinID="Delete" OnClick="DeleteButton_Click" />
            <EPiServerUI:ToolButton ID="SaveButton" DisablePageLeaveCheck="true" runat="server"
                Text="<%$ Resources: EPiServer, button.save %>" ToolTip="<%$ Resources: EPiServer, button.save %>"
                SkinID="Save" OnClick="SaveButton_Click" />
            <EPiServerUI:ToolButton ID="DeleteCustomSettings" runat="server" DisablePageLeaveCheck="true"
                                Text="<%$ Resources: EPiServer, admin.contenttypeinformation.deletecustomsettings %>"
                                ToolTip="<%$ Resources: EPiServer, admin.contenttypeinformation.deletecustomsettingstooltip %>"
                                SkinID="Delete" ConfirmMessage="<%$ Resources: EPiServer, admin.contenttypeinformation.deletecustomsettingsconfirm %>"
                                OnClick="DeleteCustomSettingsButton_Click" CausesValidation="False" />
            <EPiServerUI:ToolButton ID="CancelButton" CausesValidation="false" DisablePageLeaveCheck="true" runat="server"
                Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>"
                SkinID="Cancel" OnClick="CancelButton_Click" />
        </div>
    </div>
</asp:Content>
