<%@ Page language="c#" Codebehind="ExportData.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.ExportData"  Title="ExportData"%>
<%@ Register TagPrefix="EPiServerUI" TagName="ListBuilder" Src="ListBuilder.ascx"%>
<%@ Register TagPrefix="EPiServerUI" Namespace="EPiServer.UI.WebControls.ContentDataSource" Assembly="EPiServer.UI" %>
<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
<script type="text/javascript">
// <![CDATA[
    var abort = false;
    var iTimer = 0;
    var iTimeOut = 60;
    var isIntervalRunning = false;
    var abortInterval;

    $(document).ready(Initialize);

    //If there are no response for 60 seconds...we abort and display alert().
    //The error was probably with network connection or application domainunload.
    function Timer()
    {
        iTimer++;
        if(iTimer > iTimeOut)
        {
            abort = true;
            document.body.style.cursor='';
            EPi.ToolButton.SetEnabled('<%=FinshedExportButton.ClientID%>', true);
            EPi.ToolButton.SetEnabled('<%=AbortButton.ClientID%>', false);
            document.getElementById('<%=ProgressPicture.ClientID%>').style.display = 'none';
            window.clearInterval(abortInterval);
            alert('<%= TranslateForScript("/admin/exportdata/errorconnectiontoserver") %>');
        }
    }

    function PageTreeViewInit(treeView) {
        treeView.OnNodeSelected = OnTreeNavigation;
    }

    // Called when the the user selects a page in the tree
    function OnTreeNavigation(itemDataPath) {
        document.getElementById('<%=SelectedContent.ClientID%>').value = itemDataPath;
    }

    //Help function if you have alot of checkboxes...then you can double click anyone of these and it fills
    //this section of checkboxes to checked/unchecked.
    function ToggleCheckBoxesSelection(node)
    {
        //Gets aray with checkboxes under "node".
        var arrayCheckBoxes = EPi.GetElementsByAttribute("input", "type", "checkbox", node);

        for(i=0; i<arrayCheckBoxes.length; i++)
        {
            if(arrayCheckBoxes[i].checked)
            {
                arrayCheckBoxes[i].checked = false;
            }
            else
            {
                arrayCheckBoxes[i].checked = true;
            }
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

        //Eval JSON object.
        eval("parsedResult = " + result);
        //Writes progress of exporter
        WriteProgress(parsedResult);
        if(parsedResult["IsDone"] == false && parsedResult["IsAborting"] == false)
        {
            document.body.style.cursor='wait';
            document.getElementById('<%=ProgressPicture.ClientID%>').style.display = 'block';

            //if we pushed button abort we send "EPiAborttrue" as callback argument to server.
            if(abort)
            {
                window.clearInterval(abortInterval);
                EPi.ToolButton.SetEnabled('<%=FinshedExportButton.ClientID%>', true);
                EPi.ToolButton.SetEnabled('<%=AbortButton.ClientID%>', false);
                window.setTimeout("DoUpdateCallback('EPiAbort')", 1000);
            }
            else
            {
                //Everytime we got a new callback we set iTimer to 0. Thats how we see that we have a fresh connection.
                iTimer = 0;
                EPi.ToolButton.SetEnabled('<%=FinshedExportButton.ClientID%>', false);
                window.setTimeout("DoUpdateCallback()", 1000);
            }

        }
        else
        {
            //Done..do a postback back to this site.
            window.clearInterval(abortInterval);
            document.body.style.cursor='';
            document.getElementById('<%=ProgressPicture.ClientID%>').style.display = 'none';
            EPi.ToolButton.SetEnabled('<%=FinshedExportButton.ClientID%>', true);
            EPi.ToolButton.SetEnabled('<%=AbortButton.ClientID%>', false);

            <%= Page.ClientScript.GetPostBackEventReference(new PostBackOptions(this))%>;
        }
    }

    //Function to send callback information back to server.
    //Wrapped in a function so you can send callback arguments..if you need  to.
    function DoUpdateCallback(callbackArgument)
    {
        _ExportData_DoCallback(callbackArgument, _OnCallbackComplete);
    }

    //Writes progress of exporter.
    function WriteProgress(parsedResult)
    {
        document.getElementById('<%=PageCount.ClientID%>').innerHTML = parsedResult["PageCount"];
        document.getElementById('<%=ContentTypeCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedPageTypes"];
        document.getElementById('<%=FrameCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedFrames"];
        document.getElementById('<%=CategoryCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedCategories"];
        document.getElementById('<%=DynamicPropertyDefinitionCount.ClientID%>').innerHTML = parsedResult["DynamicPropertyDefinitionCount"];
        document.getElementById('<%=TabDefinitionCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedTabs"];
        document.getElementById('<%=VisitorGroupCount.ClientID%>').innerHTML = parsedResult["NumberOfExportedVisitorGroups"];
    }

    //Aborts import. In serverside method we set Importer.isAborting = true;
    function Abort()
    {
        abort = true;
    }

    function Initialize()
    {
        SetPropertySetting();

        var categoriesTable = document.getElementById('ExportCategoriesDiv');
        var categoriesCheckBoxes = EPi.GetElementsByAttribute("input", "type", "checkbox", categoriesTable);
        for (i = 0; i < categoriesCheckBoxes.length; i++) {
            categoriesCheckBoxes[i].onclick = function () {
                return categoryClicked(this, categoriesTable.getElementsByTagName('tr'));
            };
        }
    }

    function SetPropertySetting()
    {
        // This function do visible ExportPropertySettings check box if page types or pagetypedependency is checked
        var propertySettingsDiv = document.getElementById('ExportPropertySettingsDiv');
        if (propertySettingsDiv)
        {
            propertySettingsDiv.style.display = 'none';
            document.getElementById('<%=ExportPropertySettings.ClientID%>').enable = false;

            var exportTypesDependency = document.getElementById('<%=ExportContentTypeDependencies.ClientID%>');
            var exportPages = document.getElementById('<%=ExportPages.ClientID%>');

            var pageTypeList = document.getElementById('<%=ContentTypeList.ClientID%>');
            var exportPageType = document.getElementById('<%=ExportContentTypes.ClientID%>');

            var dynamicProperties = document.getElementById('<%=ExportDynamicPropertyDefinitions.ClientID%>');
            var dynamicPropertiesList = document.getElementById('<%=DynamicPropertyDefinitionList.ClientID%>');

            if ((exportPageType.checked & CheckBoxListSelected(pageTypeList)) || (exportTypesDependency.checked & exportPages.checked)
                || (dynamicProperties.checked & CheckBoxListSelected(dynamicPropertiesList)))
            {
                propertySettingsDiv.style.display = '';
                document.getElementById('<%=ExportPropertySettings.ClientID%>').enable  = true;
            }
            else
            {
                document.getElementById('<%=ExportPropertySettings.ClientID%>').checked = false;
            }
        }
    }

    function categoryClicked(category, categoryRows)
    {
        var checked = category.checked;
        var currentRow = category.parentNode.parentNode;
        var currentIndent = GetWidth(currentRow);
        var belowCurrentNode = false;
        for (i = 0; i < categoryRows.length; i++) {
            if (currentRow === categoryRows[i]) {
                belowCurrentNode = true;
                continue;
            }

            if (belowCurrentNode)
            {
                var indent = GetWidth(categoryRows[i]);
                if (indent > currentIndent)
                    categoryRows[i].getElementsByTagName('input')[0].checked = checked;
                else
                    break;
            }
        }
    }

    function GetWidth(categoryRow)
    {
        var width = categoryRow.getElementsByTagName('img')[0].style.width;
        return parseInt(width.substring(0, width.length - 2));
    }

     function CheckBoxListSelected(obj)
    {
        //Gets aray with checkboxes under "node".
        var arrayCheckBoxes = EPi.GetElementsByAttribute("input", "type", "checkbox", obj);

        for(i=0; i<arrayCheckBoxes.length; i++)
        {
            if(arrayCheckBoxes[i].checked)
            {
              return true;
            }
        }
        return false;
    }


// ]]>
</script>

</asp:Content>
<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <asp:PlaceHolder ID="DownloadFileView" runat="server">

        <!-- CommonScriptObject has to have at least one attribute specified though primary use is to encapsulate this pages toggleDisplay objects-->
        <EPiServerScript:ScriptSettings runat="server" ID="toggleDisplayCommon" PreventDefault="false"/>
        <div class="epi-formArea epi-paddingVertical-small">
            <!-- START Export Pages Checkbox -->
            <div class="epi-size25">
	            <asp:CheckBox Runat="server" ID="ExportPages" onclick="SetPropertySetting()"/>
	            <asp:Label Translate="#exportcontentitems" AssociatedControlID="ExportPages" runat="server"/>
			    <EPiServerScript:ScriptToggleDisplayEvent ID="ExportPagesToggleDisplayer" runat="server" EventTargetId="ExportPages" EventType="click" ToggleEnabled="true" ToggleNodeId="PageList" CommonSettingsControlID="toggleDisplayCommon" />
			    <div class="epi-paddingHorizontal" runat="server">
			        <div id="PageList" style="display:none">
			            <div class="epi-paddingVertical-small">
			                <asp:Label Translate="#selectpage" AssociatedControlID="PageRoot" runat="server" />
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
			                <asp:CheckBox runat="server" Checked="True" ID="ExportRecursively"/>
			                <asp:Label AssociatedControlID="ExportRecursively" Translate="#exportrecursively" runat="server"/>
			            </div>

			            <div>
			                <asp:CheckBox runat="server" Checked="True" ID="ExportPageFiles"/>
			                <asp:Label AssociatedControlID="ExportPageFiles" Translate="#exportpagefiles" runat="server"/>
			            </div>

			            <div>
			                <asp:CheckBox runat="server" ID="ExportContentTypeDependencies" onclick="SetPropertySetting()"/>
			                <asp:Label Translate="#exportcontenttypedependencies" AssociatedControlID="ExportContentTypeDependencies" runat="server"/>
			            </div>
			        </div>
			    </div>
            </div>
            <!-- END Export Pages Checkbox-->

		    <!-- START Export Page Types Checkbox -->
		    <div class="epi-size15">
		        <asp:CheckBox Runat="server" ID="ExportContentTypes" onclick="SetPropertySetting()"/>
			    <asp:Label Translate="#exportcontenttypes" AssociatedControlID="ExportContentTypes" runat="server"/>
			    <EPiServerScript:ScriptToggleDisplayEvent ID="ExportContentTypesToggleDisplayer" runat="server" EventTargetId="ExportContentTypes" EventType="click" ToggleEnabled="true" ToggleNodeId="ContentTypeList" CommonSettingsControlID="toggleDisplayCommon" />
			    <div class="epi-paddingHorizontal">
			        <asp:CheckBoxList Runat="server" id="ContentTypeList" RepeatColumns="3" RepeatDirection="Vertical" RepeatLayout="Table" CssClass="epi-dataTable" onclick="SetPropertySetting()" OnPreRender="Encode_List" />
			    </div>
		    </div>
		    <!-- END Export Page Types Checkbox -->

		    <!-- START Export Frames Checkbox -->
		    <div class="epi-size15">
		        <asp:CheckBox Runat="server" ID="ExportFrames" />
			    <asp:Label Translate="#exportframes" AssociatedControlID="ExportFrames" runat="server"/>
			    <EPiServerScript:ScriptToggleDisplayEvent ID="ExportFramesToggleDisplayer" runat="server" EventTargetId="ExportFrames" EventType="click" ToggleEnabled="true" ToggleNodeId="FrameList" CommonSettingsControlID="toggleDisplayCommon" />
			    <div class="epi-paddingHorizontal">
			        <asp:CheckBoxList Runat="server" ID="FrameList" CssClass="epi-dataTable" OnPreRender="Encode_List" />
			    </div>
	        </div>
		    <!-- END Export Frames Checkbox -->

		    <!-- START Export Dynamic Property Definitions Checkbox -->
		    <div class="epi-size20" runat="server" id="DynamicPropertyDefinitionSection">
		        <asp:CheckBox Runat="server" ID="ExportDynamicPropertyDefinitions" onclick="SetPropertySetting()"/>
		        <asp:Label Translate="#exportdynamicpropertydefinitions" AssociatedControlID="ExportDynamicPropertyDefinitions" runat="server"/>
		        <EPiServerScript:ScriptToggleDisplayEvent ID="ExportDynamicPropertyDefinitionsToggleDisplayer" runat="server" EventTargetId="ExportDynamicPropertyDefinitions" EventType="click" ToggleEnabled="true" ToggleNodeId="DynamicPropertyDefinitionList" CommonSettingsControlID="toggleDisplayCommon" />
		        <div class="epi-paddingHorizontal">
		            <asp:CheckBoxList Runat="server" ID="DynamicPropertyDefinitionList" onclick="SetPropertySetting()" CssClass="epi-dataTable" OnPreRender="Encode_List" />
		        </div>
		    </div>
		    <!-- END Export Dynamic Property Definitions Checkbox -->

		    <!-- START Export Tabs Checkbox -->
		    <div class="epi-size15">
		        <asp:CheckBox Runat="server" ID="ExportTabDefinitions" />
		        <asp:Label Translate="#exporttabdefinitions" AssociatedControlID="ExportTabDefinitions" runat="server"/>
		        <EPiServerScript:ScriptToggleDisplayEvent  ID="ExportTabDefinitionsToggleDisplayer" runat="server" EventTargetId="ExportTabDefinitions" EventType="click" ToggleEnabled="true" ToggleNodeId="TabDefinitionList" CommonSettingsControlID="toggleDisplayCommon" />
		        <div class="epi-paddingHorizontal">
		            <asp:CheckBoxList Runat="server" ID="TabDefinitionList" CssClass="epi-dataTable" OnPreRender="Encode_List" />
		        </div>
		    </div>
	        <!-- END Export Tabs Checkbox -->

		    <!-- START Export Categories Checkbox -->
		    <div class="epi-size15">
		        <asp:CheckBox Runat="server" ID="ExportCategories" /><asp:Label Translate="#exportcategories" AssociatedControlID="ExportCategories" runat="server"/>
		        <EPiServerScript:ScriptToggleDisplayEvent ID="ExportCategoriesToggleDisplayer" runat="server" EventTargetId="ExportCategories" EventType="click" ToggleEnabled="true" ToggleNodeId="CategoryTree" CommonSettingsControlID="toggleDisplayCommon" />
		        <div id="ExportCategoriesDiv" class="epi-paddingHorizontal">
		            <EPiServer:InputCategoryTree Runat="server" ID="CategoryTree" EnableVisibility="false" EnableSelectability="false" CssClass="epi-dataTable" style="margin-left: -20px;" />
		        </div>
		    </div>

		    <div class="epi-size15" >
		        <div id="ExportPropertySettingsDiv" style="display:none">
		            <asp:CheckBox Runat="server" ID="ExportPropertySettings"/>
		            <asp:Label Translate="#exportpropertysettings" AssociatedControlID="ExportPropertySettings" runat="server"/>
		        </div>
		    </div>

		    <!-- END Export Files Checkbox -->

		    <!-- START VistorGroups Checkbox -->
		    <div class="epi-size15">
		        <asp:CheckBox Runat="server" ID="ExportVisitorGroups" />
		        <asp:Label ID="ExportVisitorGroupsLbl" Translate="#exportvisitorgroups" AssociatedControlID="ExportVisitorGroups" runat="server"/>
		        <EPiServerScript:ScriptToggleDisplayEvent ID="ExportVisitorGroupsToggleDisplayer" runat="server" EventTargetId="ExportVisitorGroups" EventType="click" ToggleEnabled="true" ToggleNodeId="VisitorGroupsList" CommonSettingsControlID="toggleDisplayCommon" />
		       <div class="epi-paddingHorizontal">
			        <asp:CheckBoxList Runat="server" id="VisitorGroupsList" RepeatColumns="3" RepeatDirection="Vertical" RepeatLayout="Table" CssClass="epi-dataTable" OnPreRender="Encode_List"/>
			   </div>
		    </div>
		    <!-- END Export VistorGroups Checkbox -->


        </div>
        <div class="epi-buttonContainer">
            <EPiServerUI:toolbutton id="ExportButton" onclick="Exportbutton_Click" runat="server" text="<%$ Resources: EPiServer, admin.exportdata.exportbutton%>"  tooltip="<%$ Resources: EPiServer, admin.exportdata.exportbutton%>" skinid="Export" />
            <EPiServerUI:ToolButton id="TestExportButton" onclick="TestExportbutton_Click" runat="server" text="<%$ Resources: EPiServer, admin.exportdata.testexportbutton%>" tooltip="<%$ Resources: EPiServer, admin.exportdata.testexportbutton%>" skinid="File" />
        </div>
    </asp:PlaceHolder>



    <asp:PlaceHolder ID="ProgressView" runat="server">
        <p>
            <episerver:translate text="/admin/importdata/contentitemcount" runat="server" />:
            <asp:Label ID="PageCount" runat="server" />
        </p>

        <p>
            <episerver:translate text="/admin/importdata/contenttypecount" runat="server" />:
            <asp:Label ID="ContentTypeCount" runat="server" />
        </p>

        <p>
           <episerver:translate text="/admin/importdata/categorycount" runat="server" />:
           <asp:Label ID="CategoryCount" runat="server" />
        </p>

        <p>
            <episerver:translate text="/admin/importdata/framecount" runat="server" />:
            <asp:Label ID="FrameCount" runat="server" />
        </p>

        <p runat="server" id="DynamicPropertyDefinitionCountSection">
            <episerver:translate text="/admin/importdata/dynamicpropertydefinitioncount" runat="server" />:
            <asp:Label ID="DynamicPropertyDefinitionCount" runat="server" />
        </p>

        <p>
            <episerver:translate text="/admin/importdata/tabdefinitioncount" runat="server" />:
            <asp:Label ID="TabDefinitionCount" runat="server" />
        </p>

          <p>
            <episerver:translate text="/admin/importdata/visitorgroupcount" runat="server" id="Translate2" name="Translate1" />:
            <asp:Label ID="VisitorGroupCount" runat="server" />
        </p>

        <asp:PlaceHolder runat="server" ID="ExportHasErrorView">
           <div class="epi-buttonDefault">
            <asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.exportdata.exporthaserrortext%>"></asp:Literal><br />
            <EPiServerUI:ToolButton id="DownloadExportedFileButton" OnClick="DownloadExportedFileButton_Click" runat="server" text="<%$ Resources: EPiServer, admin.exportdata.exportdownloadexportfile%>" tooltip="<%$ Resources: EPiServer, admin.exportdata.exportdownloadexportfile%>" skinid="File" />
            </div>
        </asp:PlaceHolder>

        <asp:PlaceHolder runat="server">
            <div class="epi-buttonDefault">
                <EPiServer:ThemeImage ID="ProgressPicture" style="display:none;" runat="server" ImageUrl="General/ajaxloader.gif" ToolTip="<%$ Resources: EPiServer, admin.exportdata.exportinprogressimagetooltip%>"  />
            </div>

            <div class="epi-buttonContainer">
                <EPiServerUI:ToolButton id="FinshedExportButton" OnClick="FinshedExportButton_Click" runat="server" text="<%$ Resources: EPiServer, admin.exportdata.gobacktoexportdata%>" tooltip="<%$ Resources: EPiServer, admin.exportdata.gobacktoexportdata%>" skinid="Refresh" /><EPiServerUI:ToolButton id="AbortButton" GeneratesPostBack="false" OnClientClick="Abort();" runat="server" text="<%$ Resources: EPiServer, admin.exportdata.abortexport%>" tooltip="<%$ Resources: EPiServer, admin.exportdata.abortexport%>" skinid="Cancel" />
            </div>
        </asp:PlaceHolder>

    </asp:PlaceHolder>
    <asp:HiddenField runat="server" ID="SelectedContent" />
    <EPiServerUI:ContentDataSource ID="contentDataSource" UseFallbackLanguage="true" AccessLevel="NoAccess" runat="server" IncludeRootItem="true" ContentLink="<%# EPiServer.Core.PageReference.RootPage %>" EvaluateHasChildren="<%# !EPiServer.Configuration.Settings.Instance.UIOptimizeTreeForSpeed %>" />
</asp:Content>
