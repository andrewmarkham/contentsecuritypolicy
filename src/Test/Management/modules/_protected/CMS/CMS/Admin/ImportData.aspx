<%@ Page Language="c#" Codebehind="ImportData.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.ImportData"  Title="ImportData" %>
<%@ Register TagPrefix="EPiServerUI" Namespace="EPiServer.UI.WebControls.ContentDataSource" Assembly="EPiServer.UI" %>
<asp:Content ID="Content2" ContentPlaceHolderID="HeaderContentRegion" runat="server">

<script type="text/javascript">
// <![CDATA[
        
    var of = " <%= TranslateForScript("/admin/importdata/of") %> ";
    var abort = false;
    var iTimer = 0;
    var iTimeOut = 60;
    var isIntervalRunning = false;
    var abortInterval;
    
    //If there are no response for 60 seconds...we abort and display alert(). 
    //The error was probably with network connection or application domainunload.
    function Timer()
    {
        iTimer++;        
        if(iTimer > iTimeOut)
        {            
            abort = true;
            document.body.style.cursor='';
            EPi.ToolButton.SetEnabled('<%=FinshedImportButton.ClientID%>', true);
            EPi.ToolButton.SetEnabled('<%=AbortButton.ClientID%>', false);
            document.getElementById('<%=ProgressPicture.ClientID%>').style.display = 'none';            
            window.clearInterval(abortInterval);
            alert('<%= TranslateForScript("/admin/importdata/errorconnectiontoserver") %>');
        }
    }
    
    //Response from server side with data from importer as a JSON object.
    function _OnCallbackComplete(result, context)
    {
        var parsedResult = null;
        
        //This is done so we can 
        if (!isIntervalRunning)
        {
            abortInterval = window.setInterval(Timer, 1000);
            isIntervalRunning = true;
        }
        
        
        eval("parsedResult = " + result);
        //Writes progress of importer
        WriteProgress(parsedResult);
        if(parsedResult["IsDone"] == false && parsedResult["IsAborting"] == false)
        {    
            document.getElementById('<%=ProgressPicture.ClientID%>').style.display = 'block';
            document.body.style.cursor='wait';
            
            //if we pushed button abort we send "EPiAbort" as callback argument to server.            
            if(abort)
            {
                window.clearInterval(abortInterval);
                EPi.ToolButton.SetEnabled('<%=FinshedImportButton.ClientID%>', true);
                window.setTimeout("DoUpdateCallback('EPiAbort')", 1000);
            }   
            else
            {
                //Everytime we got a new callback we set iTimer to 0. Thats how we see that we have a fresh connection.
                iTimer = 0;
                EPi.ToolButton.SetEnabled('<%=FinshedImportButton.ClientID%>', false);
                window.setTimeout("DoUpdateCallback()", 1000);
            }  
            

        }
        else
        {         
            //Done..do a postback back to this site.
            window.clearInterval(abortInterval);
            document.body.style.cursor='';
            document.getElementById('<%=ProgressPicture.ClientID%>').style.display = 'none';
            EPi.ToolButton.SetEnabled('<%=FinshedImportButton.ClientID%>', true);
                       
            <%= Page.ClientScript.GetPostBackEventReference(new PostBackOptions(this))%>;
        }

    }
    
    function PageTreeViewInit(treeView) {
        treeView.OnNodeSelected = OnTreeNavigation;
    }

    // Called when the the user selects a page in the tree
    function OnTreeNavigation(itemDataPath) {
        document.getElementById('<%=SelectedContent.ClientID%>').value = itemDataPath;
    }
   
    
    //Function to send callback information back to server.
    function DoUpdateCallback(callbackArgument)
    {
        _ImportData_Callback(callbackArgument, _OnCallbackComplete);
    }
    
    //Writes progress of importer.
    function WriteProgress(parsedResult)
    {
        var numberOfPagesToImport = parsedResult["NumberOfPagesToImport"];
        if(numberOfPagesToImport != "")
        {
            numberOfPagesToImport = of + numberOfPagesToImport;
        }
        
        document.getElementById('<%=PageCount.ClientID%>').innerHTML = parsedResult["PageCount"] + numberOfPagesToImport;
        document.getElementById('<%=ContentTypeCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedPageTypes"]; 
        document.getElementById('<%=FrameCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedFrames"]; 
        document.getElementById('<%=CategoryCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedCategories"]; 
        document.getElementById('<%=DynamicPropertyDefinitionCount.ClientID%>').innerHTML = parsedResult["DynamicPropertyDefinitionCount"]; 
        document.getElementById('<%=TabDefinitionCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedTabs"]; 
        document.getElementById('<%=VisitorGroupCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedVisitorGroups"]; 
    }
    
    //Aborts import. In serverside method we set Importer.Abort() when next callback occurs
    function Abort()
    {
        abort = true;
    }
   
   function CheckVersion()
   {
        var fileObject = document.getElementById('<%=File1.ClientID%>');
        if (fileObject != null && fileObject.value != null)
        {
            if (fileObject.value.indexOf(".epi4") >= 0)
            {
                document.getElementById('<%=AutocorrectionArea.ClientID%>').style.display = 'block';
            }
            else
            {
                document.getElementById('<%=AutocorrectionArea.ClientID%>').style.display = 'none';
                document.getElementById('<%=AutoCorrection.ClientID%>').checked = false;
            }
        }
       return false;
   }
    
// ]]> 
</script>

</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">
    <script type="text/javascript" language="javascript">
		    document.forms[0].encType = "multipart/form-data";
    </script>
   
    <asp:PlaceHolder ID="UploadFileView" runat="server">
        <div class="epi-formArea">
            <div class="epi-size20 epi-paddingVertical-small">
                <div>
                    <asp:Label runat="server" AssociatedControlID="File1" Text="<%$ Resources: EPiServer, admin.importdata.selectfile %>" />
                    <input id="File1" type="file" runat="server" onchange="CheckVersion()"/>
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="PageRoot" Text="<%$ Resources: EPiServer, admin.importdata.selectpageroot %>" />        
                     <div class="episcroll episerver-pagetree-selfcontained">
                        <EPiServerUI:PageTreeView ID="PageRoot" DataSourceID="contentDataSource" CssClass="episerver-pagetreeview" runat="server" 
                            ClientInitializationCallback="PageTreeViewInit" 
                            ExpandDepth="1" 
                            DataTextField="Name" 
                            ExpandOnSelect="false"
                            EnableViewState="false">
                            <TreeNodeTemplate>
                                <a href="#"><%# Server.HtmlEncode(((PageTreeNode)Container.DataItem).Text) %></a>
                            </TreeNodeTemplate>
                        </EPiServerUI:PageTreeView>
                    </div>
                </div>
                <div>
                    <asp:CheckBox  ID="UpdateExistingPagesCheckBox" runat="server" Checked="true" Text="<%$ Resources: EPiServer, admin.importdata.updateexistingcontentitems %>" />
                </div>
                 <div>
                    <asp:CheckBox  ID="AllowBreakingChangesCheckBox" runat="server" Text="<%$ Resources: EPiServer, admin.importdata.allowbreakingchanges %>" />
                </div>
               <div ID="AutocorrectionArea" style="display:none;" runat="server">
                    <asp:Label runat="server" AssociatedControlID="AutoCorrection" Text="<%$ Resources: EPiServer, admin.importdata.autocorrection %>" />        
    		        <asp:CheckBox  id="AutoCorrection" runat="server" />
                </div>
    		    <div> 
                  <asp:Label  AssociatedControlID="LanguageList"  Translate="#selectedlanguage"  runat="server" Text="<%$ Resources: EPiServer, admin.importdata.selectedlanguage%>" />
                  <asp:RadioButtonList  style="display:inline;"  Runat="server"  ID="LanguageList"  RepeatColumns="3" RepeatDirection="Vertical" RepeatLayout="Table" />
                </div>
            </div>
            <!--  
            <EPiServer:Translate Text="#allowpagesync" runat="server" ID="Translate5" NAME="Translate2"/>
            <asp:CheckBox  id="AllowPageSync" runat="server" />
			-->

            <div class="epi-buttonContainer">
                <EPiServerUI:ToolButton id="ImportFile" onclick="ImportFile_Click" runat="server" text="<%$ Resources: EPiServer, admin.importdata.beginimport%>"  tooltip="<%$ Resources: EPiServer, admin.importdata.beginimport%>" skinid="Import" />
                <EPiServerUI:ToolButton id="VerifyImportFile" onclick="VerifyImportFile_Click" runat="server" text="<%$ Resources: EPiServer, admin.importdata.verifyimportfile%>" tooltip="<%$ Resources: EPiServer, admin.importdata.verifyimportfile%>" skinid="File" />
            </div>
        </div>
    </asp:PlaceHolder>
    
    <asp:PlaceHolder ID="ReportView" runat="server">
        <p>
            <episerver:translate text="#contentitemcount" runat="server" />:
            <asp:Label ID="PageCount" runat="server" />
        </p>
                    
        <p>
            <episerver:translate text="#contenttypecount" runat="server" />:
            <asp:Label ID="ContentTypeCount" runat="server" />
        </p>
        
        <p>
            <episerver:translate text="#categorycount" runat="server" />:
            <asp:Label ID="CategoryCount" runat="server" />
        </p>
        
        <p>
            <episerver:translate text="#framecount" runat="server" />:
            <asp:Label ID="FrameCount" runat="server" />
        </p>
                    
        <p id="DynamicPropertyDefinitionCountSection" runat="server">
            <episerver:translate text="#dynamicpropertydefinitioncount" runat="server" />:
            <asp:Label ID="DynamicPropertyDefinitionCount" runat="server" />
        </p>
        
        
        <p>
            <episerver:translate text="#tabdefinitioncount" runat="server" />:
            <asp:Label ID="TabDefinitionCount" runat="server" />
        </p>            
        
        <p>
            <episerver:translate text="#visitorgroupcount" runat="server" id="Translate2" name="Translate1" />:
            <asp:Label ID="VisitorGroupCount" runat="server" />
        </p>
                    
        <div class="epi-buttonDefault">
            <EPiServer:ThemeImage ID="ProgressPicture" style="display:none;"  runat="server" ImageUrl="General/AjaxLoader.gif" ToolTip="<%$ Resources: EPiServer, admin.importdata.importinprogressimagetooltip%>"  />
        </div>
        <div class="epi-buttonContainer">
            <EPiServerUI:ToolButton id="FinshedImportButton" Enabled="false" OnClick="FinshedImportButton_Click" runat="server" text="<%$ Resources: EPiServer, admin.importdata.gobacktoimportdata%>" tooltip="<%$ Resources: EPiServer, admin.importdata.gobacktoimportdata%>" skinid="Refresh" />
            <EPiServerUI:ToolButton id="AbortButton" GeneratesPostBack="false" OnClientClick="Abort();" runat="server" text="<%$ Resources: EPiServer, admin.importdata.abortimport%>" tooltip="<%$ Resources: EPiServer, admin.importdata.abortimport%>" skinid="Cancel" />
        </div>
    </asp:PlaceHolder>
    <asp:HiddenField runat="server" ID="SelectedContent" />
    <EPiServerUI:ContentDataSource ID="contentDataSource" UseFallbackLanguage="true" AccessLevel="NoAccess" runat="server" IncludeRootItem="true" ContentLink="<%# EPiServer.Core.PageReference.RootPage %>" EvaluateHasChildren="<%# !EPiServer.Configuration.Settings.Instance.UIOptimizeTreeForSpeed %>" />
</asp:Content>
