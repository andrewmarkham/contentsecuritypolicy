<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="ImageEditor.aspx.cs" Inherits="EPiServer.UI.Edit.ImageEditor.ImageEditor" %>

<%@ Import Namespace="EPiServer.Configuration" %>
<asp:content contentplaceholderid="HeaderContentRegion" runat="server">
    <meta http-equiv="imagetoolbar" content="no" />
    <link type="text/css" rel="Stylesheet" href="<%= EPiServer.UriSupport.ResolveUrlFromUtilBySettings("styles/ImageEditor.css") %>" />
</asp:content>

<asp:content id="MainRegion" runat="server" contentplaceholderid="FullRegion">
    <div id="fullArea">
        <asp:Panel ID="ToolbuttonPanel" runat="server" CssClass="epi-applicationToolbar epi-paddingVertical-xsmall">
            <EPiServerUI:ToolButtonContainer runat="server">
                <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="Crop" onClientClick="SwitchTool(_controls.CropPane);" ID="Crop"  Text="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.crop%>" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.crop%>" runat="server" />
                <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="Resize" onClientClick="SwitchTool(_controls.ResizePane)" ID="Resize" Text="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.resize%>" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.resize%>" runat="server" />
                <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="Transform" onClientClick="SwitchTool(_controls.TransformPane)" ID="Adjust" Text="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.transform%>" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.transform%>" runat="server" />
            </EPiServerUI:ToolButtonContainer>
            
            <EPiServerUI:ToolButtonContainer runat="server">
                <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="Undo" onClientClick="Undo();" ID="Undo"  runat="server" Enabled="false" Text="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.undo%>" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.undo%>" />
                <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="Redo" onClientClick="Redo();"  ID="Redo"  runat="server" Enabled="false" Text="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.redo%>" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.redo%>" />            
                <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="Revert" onClientClick="Revert();" ID="reverttooriginal" runat="server"  Enabled="false" Text="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.reverttooriginal%>" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.reverttooriginal%>"/>
            </EPiServerUI:ToolButtonContainer>

            <EPiServerUI:ToolButtonContainer runat="server">
                <label for="ZoomTask"><asp:Literal runat="server" Text="<%$ Resources: EPiServer, button.zoom %>" /></label>
                <select id="ZoomTask" runat="server" class="episize80" onchange="Zoom(event)" style="margin-top:2px"></select>
            </EPiServerUI:ToolButtonContainer>
            <EPiServerUI:ToolButtonContainer runat="server">
                <EPiServerUI:HelpButton runat="server" />
            </EPiServerUI:ToolButtonContainer>
            <img alt="Loading..." src='<%= ResolveClientUrl("~/App_Themes/Default/Images/General/AjaxLoader.gif") %>' width="16" height="16" id="ajaxLoader" style="padding:4px;" />
        </asp:Panel>

        <div id="leftArea" class="epi-formArea">
            <asp:Panel ID="ToolBarPanel" CssClass="toolArea" runat="server">
                <fieldset id="GeneralPane">
                    <legend>
                        <%=Translate("/edit/imageeditor/generalinformationheading")%>
                    </legend>
                    <div>
                        <asp:literal runat="server" ID="GeneralInformationText" Text="<%$ Resources: EPiServer, edit.imageeditor.generalinformation %>" />
                    </div>
                </fieldset>
                <!-- Crop -->
                <fieldset id="CropPane" style="display:none">
                    <legend>
                        <%=Translate("/edit/imageeditor/cropinformation/crop")%>
                    </legend>
                    <div class="toolAreaHelp">
                        <%=Translate("/edit/imageeditor/cropinformation/help")%>
                    </div>
                    <div>
                        <label for="Croppreset">
                            <%=Translate("/edit/imageeditor/resizeinformation/preset")%>
                        </label>
                        <select id="Croppreset"  runat="server" onchange='OnPresetChange(this, "Crop")'>
                        </select>                                    
                        
                        <label for="txtCropTop">
                            <%=Translate("/edit/imageeditor/cropinformation/top")%>
                        </label>
                        <input class="episize35" type="text" id="txtCropTop" onchange="ChangeCropSelection()" onkeypress="ValidateCrop(event)"/>
                        
                        
                        <label for="txtCropLeft">
                            <%=Translate("/edit/imageeditor/cropinformation/left")%>
                        </label>
                        <input class="episize35" type="text" id="txtCropLeft" onchange="ChangeCropSelection()" onkeypress="ValidateCrop(event)"/>
                        
                        
                        <label for="txtCropWidth">
                            <%=Translate("/edit/imageeditor/cropinformation/width")%>
                        </label>
                        <input class="episize35" type="text" id="txtCropWidth" onchange="ChangeCropSelection()" onkeypress="ValidateCrop(event)"/>
                    
                        <label for="txtCropHeight">
                            <%=Translate("/edit/imageeditor/cropinformation/height")%>
                        </label>         
                        <input class="episize35" type="text" id="txtCropHeight" onchange="ChangeCropSelection()" onkeypress="ValidateCrop(event)" />   
                    </div>
                    <div class="toolCommandButtons">
                        <EPiServerUI:ToolButton ID="CropOk" SkinId="Check" Enabled="true" Text="<%$ Resources: EPiServer, button.apply %>" ToolTip="<%$ Resources: EPiServer, button.apply %>" runat="server" GeneratesPostBack="false" onClientClick="Crop()" />	    
                        <EPiServerUI:ToolButton ID="CropCancel" Enabled="true" SkinId="Cancel" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" runat="server" GeneratesPostBack="false" onClientClick="SwitchTool(null)" />
                    </div>
                </fieldset>   
                <!-- Resize -->
                <fieldset id="ResizePane" style="display:none">
                    <legend>
                        <%=Translate("/edit/imageeditor/resizeinformation/resize")%>
                    </legend>
                    <div class="toolAreaHelp">
                        <%=Translate("/edit/imageeditor/resizeinformation/help")%>
                    </div>
                    <div>
                        <label for="Preset">
                            <%=Translate("/edit/imageeditor/resizeinformation/preset")%>
                        </label>
                        <select id="Preset" runat="server" onchange='OnPresetChange(this, "Resize")' clientidmode="Static">                                        
                        </select>                                    
                    
                        <label for="txtResizeWidth">
                            <%=Translate("/edit/imageeditor/resizeinformation/width")%>
                        </label>
                        <input class="episize35" type="text" id="txtResizeWidth" maxlength="4" onchange="ChangeResizeSelection(this)" onkeypress="ValidateResize(event, this);" />
                        
                        <label for="txtResizeHeight">
                            <%=Translate("/edit/imageeditor/resizeinformation/height")%>
                        </label>
                        <input class="episize35" type="text" id="txtResizeHeight" maxlength="4" onchange="ChangeResizeSelection(this)" onkeypress="ValidateResize(event, this)" />
                    
                        <input id="checkProportions" type="checkbox" checked="true" onclick="HandleProportion()"  />
                        <label for="checkProportions">
                            <%=Translate("/edit/imageeditor/resizeinformation/contrainproportion")%>
                            
                        </label>        
                    </div>    
                    <div class="toolCommandButtons">    
                        <EPiServerUI:ToolButton ID="ResizeOk" Enabled="true" SkinId="Check" Text="<%$ Resources: EPiServer, button.apply %>" ToolTip="<%$ Resources: EPiServer, button.apply %>" runat="server"  GeneratesPostBack="false" onClientClick="Resize()" />
                        <EPiServerUI:ToolButton ID="ResizeCancel" Enabled="true" SkinId="Cancel" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" runat="server" GeneratesPostBack="false" onClientClick="SwitchTool(null)" />
                    </div>
                </fieldset>   
                <!-- Transform -->
                <fieldset id="TransformPane" style="display:none">
                    <legend>
                        <%=Translate("/edit/imageeditor/transforminformation/transformation")%>
                    </legend>
                    <div class="toolAreaHelp">
                        <%=Translate("/edit/imageeditor/transforminformation/help")%>
                    </div>
                    <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="RotateClockWise" onClientClick="Rotate(90)" runat="server" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.transforminformation.rotateclockwise %>"/>
                    <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="RotateAntiCloskWise" onClientClick="Rotate(270)" runat="server" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.transforminformation.rotatecounterclockwise %>"/>

                    <EPiServerUI:ToolButton GeneratesPostBack="false"  SkinID="FlipVertical" onClientClick="FlipX()" runat="server" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.transforminformation.flipvertical %>"/>
                    <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="FlipHorizontal" onClientClick="FlipY()" runat="server" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.transforminformation.fliphorizontal %>"/>
                    
                    <label for="CheckboxGrayscale">
                        <%=Translate("/edit/imageeditor/transforminformation/grayscale")%>
                    </label>              
                    <input type="checkbox" id="CheckboxGrayscale" onclick="Grayscale(this)" />
                </fieldset> 
            </asp:Panel>
            
            <!------------------------->
            <!-- IMAGE EDITING SECTION -->
            <!------------------------->
            <div id="WorkAreaContainer" onscroll="ManageScroll()" ondragstart="return false" onmousemove="OnMouseMove(event)">
                <div id="WorkArea" onmousedown="OnMouseDown(event);return false;">
                    <div id="selectionArea">
                        <!-- Placeholder for selection image -->
                    </div>
                    <div id="p1" style="cursor:nw-resize;" class="resizePlaceHolders"></div>
                    <div id="p2" style="cursor:n-resize;" class="resizePlaceHolders"></div>
                    <div id="p3" style="cursor:ne-resize;" class="resizePlaceHolders"></div>
                    <div id="p4" style="cursor:w-resize;" class="resizePlaceHolders" ></div>
                    <div id="p5" style="cursor:se-resize;" class="resizePlaceHolders"></div>
                    <div id="p6" style="cursor:s-resize;" class="resizePlaceHolders"></div>
                    <div id="p7" style="cursor:sw-resize;" class="resizePlaceHolders"></div>
                    <div id="p8" style="cursor:e-resize;" class="resizePlaceHolders"></div>
                    
                    <div id="imageContainer">
                        <!-- Placeholder for real image -->
                    </div>
                </div>
            </div> 
        </div>         
        <div id="rightArea" class="epi-formArea">
            <!-- File manager panel -->
            <asp:PlaceHolder runat="server" ID="FileManagerSection" Visible="false">
                <!------------------------->
                <!-- INFORMATION SECTION -->
                <!------------------------->
                <fieldset id="fieldset_information">
                    <legend>
                        <%=Translate("/editor/tools/imageeditor/informationheading")%>
                    </legend>
                    <!-- Src Url -->
                    <div class="epi-size10">
                        <div>
                            <label for="filename" class="episize100">
                                <%=Translate("/editor/tools/imageeditor/imagefile")%>
                            </label>
                            <span id="filename"></span>
                            <input id="imagePath" type="hidden" />
                        </div>

    <%-- Removed filesize since it is misinterpreted by users and not showing correct values when zoom is not 100%
                        <!-- File Size -->
                        <div class="epirowcontainer" style="margin: 6px 0px;">
                            <label for="filesize" class="episize100">
                                <%=Translate("/editor/tools/imageeditor/filesize")%>
                            </label>
                            <span id="filesize"></span>&nbsp;<%=Translate("/edit/imageeditor/information/unitkilobytes")%>
                        </div>
    --%>

                        <!-- Width -->
                        <div>
                            <label for="widthDisplay" class="episize100">
                                <%=Translate("/edit/imageeditor/imgpagelabels/width")%>
                            </label>
                            <span id="widthDisplay"></span>
                        </div>
                        <!-- Height -->
                        <div>
                            <label for="heightDisplay" class="episize100">
                                <%=Translate("/edit/imageeditor/imgpagelabels/height")%>
                            </label>
                            <span id="heightDisplay"></span>
                        </div>
                    </div>
                </fieldset>
            </asp:PlaceHolder>
            <!-- Compression/Save Options -->
            <fieldset id="CompressionBox" runat="server">
                <legend>
                    <%=Translate("/button/save")%>
                </legend>
                <div class="epi-size5">
                    <div>
                        <label class="episize100" for="Quality">
                            <%=Translate("/edit/imageeditor/compressioninformation/quality")%>
                        </label>
                        <select id="Quality" runat="server" onchange='OnQualityChange(this.value)'>
                        </select>
                    </div>
                </div>
                <asp:Panel runat="server" ID="AutoSaveLocationPanel">
                    <div class="epi-size15">
                        <div>
                            <input type="radio" name="SaveMode" id="radioSaveCopy" checked="checked" />
                            <label for="radioSaveCopy"><asp:Literal runat="server" Text="<%$ Resources: EPiServer, edit.imageeditor.saveoptions.savecopy %>" /></label>
                        </div>
                        <div>
                            <input type="radio" name="SaveMode" id="radioSaveOriginal"/>
                            <label for="radioSaveOriginal"><asp:Literal runat="server" Text="<%$ Resources: EPiServer, edit.imageeditor.saveoptions.saveoriginal %>" /></label>
                        </div>
                    </div>
                </asp:Panel>
            </fieldset>
            <!-- Buttons -->
            <div class="toolCommandButtons" style="position:absolute;">
                <asp:Panel ID="EditorButtonRow" runat="server">
                    <EPiServerUI:ToolButton ID="okButton" IsDialogButton="True" OnClientClick="OnOkButtonClick(this)" DisablePageLeaveCheck="true" GeneratesPostBack="false" Text="<%$ Resources:EPiServer, button.ok %>" ToolTip="<%$ Resources:EPiServer, button.ok %>" runat="server" />
                    <EPiServerUI:ToolButton ID="cancelButton" IsDialogButton="True" OnClientClick="CancelClick();" GeneratesPostBack="false" Text="<%$ Resources:EPiServer, button.cancel %>" ToolTip="<%$ Resources:EPiServer, button.cancel %>" runat="server" />
                </asp:Panel>  
                
                <asp:Panel ID="FileManagerButtonRow" Visible="false" runat="server">
                    <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="Save" onClientClick="OpenSaveAsDialog('SaveOriginal')" DisablePageLeaveCheck="true" ID="Save" IsDialogButton="True" runat="server" Text="<%$ Resources: EPiServer, button.saveonly %>" ToolTip="<%$ Resources: EPiServer, button.saveonly %>"/>            
                    <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="Save" onClientClick="OpenSaveAsDialog('SaveCopy')" ID="Saveas" IsDialogButton="True" runat="server" Text="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.saveas %>" ToolTip="<%$ Resources: EPiServer, edit.imageeditor.imgpagelabels.saveas%>" />
                    <EPiServerUI:ToolButton GeneratesPostBack="false" SkinID="cancel" onClientClick="EPi.GetDialog().Close()" ID="Cancel" IsDialogButton="True" runat="server"  Text="<%$ Resources: EPiServer, button.close %>" ToolTip="<%$ Resources: EPiServer, button.close %>"/>
                </asp:Panel>
            </div>
        </div>
    </div>
          
    <script type="text/javascript">
        // The flag to indicate that a property has been changed
        var isPropertyChanged = false;
        var sUndoTaskId = "<%= Undo.ClientID %>";
        var sRedoTaskId = "<%= Redo.ClientID %>";
        var sRevertTaskId = "<%= reverttooriginal.ClientID %>";         
        var sResizeOKButtonId = "<%= ResizeOk.ClientID %>";
        var sZoomTaskId = "<%= ZoomTask.ClientID %>";

        var sQuality = document.getElementById('<%=Quality.ClientID %>');
        var sPreset = document.getElementById('<%=Preset.ClientID %>');    
        var sCropPreset = document.getElementById('<%=Croppreset.ClientID %>');    
        
        var sManualDimensionOverflow = '<%= TranslateForScript("/edit/imageeditor/imgpagelabels/manualdimensionoverflow")%>';
        var sErrorMessage = '<%= TranslateForScript("/editor/tools/imageeditor/noimagevalidationmessage")%>';
        var sUnappliedChanges = '<%= TranslateForScript("/editor/tools/imageeditor/unappliedchanges")%>';
        var sCacheWarning = '<%= TranslateForScript("/editor/tools/imageeditor/cachewarning")%>';
        var isHtmlAttributesEnabled = <%=IsHtmlAttributesEnabled.ToString().ToLower()%>;
        var isOpenedFromFileManager = <%=IsOpenedFromFileManager.ToString().ToLower()%>;
        var imageFileName = '<%=HttpUtility.HtmlEncode(FileImageName)%>';
        var dialogSizeSetting = '<%= DialogSizeSetting()%>';

        var modeSaveCopy = "AutoSaveCopy";
        var modeSaveOriginal = "AutoSaveOriginal";
        var currentProjectId = null;

        // sets the current project id only if project mode is enabled.
        // this is called on window load, so any asyc call will be long finished until user modify the image and press save.
        var require = window.top.require;

        require([
            "epi/dependency",
            "dojo/when"
        ], function(
            dependency,
            when) {
            var projectService = dependency.resolve("epi.cms.ProjectService");

            if (projectService.isProjectModeEnabled) {
                when(projectService.getCurrentProjectId().then(function(projectId) {
                    currentProjectId = projectId;
                })).always(function() {
                    Initialize(<%= IsEditorEnabledForJavascript() %>, currentProjectId);
                });
            } else {
                Initialize(<%= IsEditorEnabledForJavascript() %>, null);
            }
        });


        function OpenSaveAsDialog(saveMode)
        {
            if ((saveMode === modeSaveCopy && <%= (!UserHasAccessToSaveCopyContent()).ToString().ToLower() %>) ||
                (saveMode === modeSaveOriginal && <%= (!UserHasAccessToSaveOriginalContent()).ToString().ToLower() %>)) {
                
                alert('<%= TranslateForScript("/editor/tools/imageeditor/cannotaccesstosavecontent")%>');
                return;
            }
            
            if(hasUnappliedChanges()){
                alert(sUnappliedChanges);
                return;
            }

            if (saveMode === modeSaveOriginal) {
                alert(sCacheWarning);
            }

            var saveAsDialogUrl = EPi.ResolveUrlFromUI("Edit/ImageEditor/FileSaveAs.aspx") + "?epieditmode=True";

            // append the project id in query string so the core can load the origional image 
            if (currentProjectId && currentProjectId != "") {
                saveAsDialogUrl += "&epiprojects=" + currentProjectId;
            }

            var contentLink = _image.contentLink;
            if (contentLink) {
                saveAsDialogUrl += "&contentLink=" + contentLink;
            }
            
            var pageFolderId = "<%= Server.HtmlEncode(Request.QueryString["pageFolderId"]) %>";
            var pageId = "<%= Server.HtmlEncode(Request.QueryString["id"]) %>";
            var parent = "<%= Server.HtmlEncode(Request.QueryString["parentId"]) %>";
            

            var queryParameters = "&imagePath=" + encodeURIComponent(_image.source) + "&saveMode=" + saveMode + "&pageFolderId=" + pageFolderId + "&id=" + pageId + "&parent=" + parent;
            queryParameters += "&quality=" + sQuality.value + "&commands=" + commandQueue.Serialize() + "&__epiXSRF=" + encodeURIComponent(document.getElementsByName("__epiXSRF")[0].value);

            EPi.CreateDialog(saveAsDialogUrl + queryParameters, OnImageSaveAsCompleted, null, null, {width: 400, height: 215});
        }
        
        function OnOkButtonClick()
        {
            if(hasUnappliedChanges()){
                alert(sUnappliedChanges);
                return;
            }
            // Since PageLeaveCheck in dialogs is specialized (due to IE6 bug/feature) we need to manually call TraverseTrigger by ourselves since
            // the built-in TraverseTrigger will occur to late causing a Page Leave confirm dialog even though it's ok to close the dialog.
            // arguments[0] is passed to this function and is the element calling this function in onclick.
            EPi.PageLeaveCheck.TraverseTrigger(arguments[0]);
            if (commandQueue.IsEmpty() && !isPropertyChanged)
            {
                if(isHtmlAttributesEnabled){
                    OkClick();
                }
                else{
                    EPi.GetDialog().Close();
                }
            }
            else
            {
                var saveMode = (document.getElementById("radioSaveCopy").checked ? modeSaveCopy : modeSaveOriginal);
                OpenSaveAsDialog(saveMode);
            }
        }
        
        function OnPresetChange(target, action)
        {
            if (_controls && _browser) {
                switch (action) {                
                    case "Crop":
                        if (!_controls.SelectCropPreset) {
                            _browser.DOMObject(target.id, "SelectCropPreset");
                        }
                        break;
                    case "Resize":
                        if (!_controls.SelectResizePreset) {
                            _browser.DOMObject(target.id, "SelectResizePreset");
                        }
                        break;
                }
            }
            SetPresetValues(target.value, action)
        }

        function OnQualityChange(value)
        {
            Compress(value);
            isPropertyChanged = true;
        }
        
    </script>
</asp:content>
