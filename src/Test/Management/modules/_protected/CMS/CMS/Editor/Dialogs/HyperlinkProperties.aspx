<%@ Page language="c#" Codebehind="HyperlinkProperties.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Editor.Tools.Dialogs.HyperlinkProperties" %>
<%@ Import Namespace="EPiServer.Configuration" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
    <script type="text/javascript">
    // <![CDATA[
    /*
     * JavaScript support routines for EPiServer
     * Copyright (c) 2007 EPiServer AB
    */
    
        var isImageToolAvailable;
        
        function setImageToolAvailability()
        {
	        if (startLink.parentWindow && startLink.parentWindow.EditorScriptVersions)
	        {
		        for(var index = 0; index < startLink.parentWindow.EditorScriptVersions.length; index++)
		        {
			        if (startLink.parentWindow.EditorScriptVersions[index].indexOf('HyperlinkImageProperties') == 0)
			        {
				        isImageToolAvailable = true;
				        return;
			        }
		        }
	        }  	
        }
        
        function setContentEditVisibility() {
            //Check the querystring. If we get a diablecontentedit that is set to true parameter we want to hide the content parts of the dialog.        
	        if(<%= Request.QueryString["diablecontentedit"] != null && String.Compare(Request.QueryString["diablecontentedit"], "true") == 0 ? "true" : "false" %>)
	        {
	            $("#linkitemtypeimage").closest("div").hide();
	            $("#linkitemtypetext").closest("div").hide();
	            
	            $("#documentitemtypeimage").closest("div").hide();
	            $("#documentitemtypetext").closest("div").hide();
	            
	            $("#emailitemtypeimage").closest("div").hide();
	            $("#emailitemtypetext").closest("div").hide();
	        }
        }

        /* Trim() function duplicated from HtmlTextBox2_API.js */
        String.prototype.Trim = new Function("return this.replace(/^\\s+|\\s+$/g,'')");

        var startLink;

        var baseHyperlinkImagePropertiesUrl = '';
        var baseFileManagerBrowserUrl = '';
        var editorID;

        var returnValueValidationErrorMessage = null;

        function GetActiveTab()
        {
	        if(WebPageTab.IsActive())
		        return WebPageTab;
	        else if(DocumentTab.IsActive())
		        return DocumentTab;
	        else if(EmailTab.IsActive())
		        return EmailTab;
        }

        function TabObject() 
        {}

        var WebPageTab	= new TabObject();
        var DocumentTab = new TabObject();
        var EmailTab	= new TabObject();

        TabObject.prototype.IsActive = function()
        {
            var p;
	        return (this.TabElement.style.display === 'block');
        }
        TabObject.prototype.GetActiveUrlFieldValue = function()
        {
	        if(this.activeUrlField.tagName.toUpperCase() == 'INPUT')
		        return this.activeUrlField.value.Trim();
	        else if(this.activeUrlField.tagName.toUpperCase() == 'SELECT')
		        return this.activeUrlField[this.activeUrlField.selectedIndex].value;
        }
        TabObject.prototype.GetCompleteUrl = function()
        {
	        // TODO: Expand logic to handle file:// and https:// (would get double prefixes now)
	        if(this.GetActiveUrlFieldValue().indexOf(this.activeUrlPrefix) == 0)
		        return this.GetActiveUrlFieldValue();
	        else if(this.GetActiveUrlFieldValue().length > 0)
		        return this.activeUrlPrefix + this.GetActiveUrlFieldValue();
	        else
		        return '';
        }
        TabObject.prototype.GetDisplayUrl = function()
        {
	        var displayUrl;
	        if(this.isInternalPageLink)
		        displayUrl = this.InternalPage.value;
	        else if(this.isInternalDocument)
	        {
		        if (this.GetActiveUrlFieldValue().lastIndexOf('/') > 0)
			        displayUrl = '<%=TranslateForScript("/editor/tools/hyperlinkproperties/tabs/document")%>: ' + 
						        this.GetActiveUrlFieldValue().substring(
							        this.GetActiveUrlFieldValue().lastIndexOf('/') + 1, this.GetActiveUrlFieldValue().length);
		        else
			        displayUrl = this.GetActiveUrlFieldValue();	
	        }
	        else if(this.activeUrlPrefix == '#')
		        displayUrl = '<%=TranslateForScript("/editor/tools/hyperlinkproperties/anchor")%> ' + this.GetActiveUrlFieldValue();
	        else if(this.activeUrlPrefix == 'mailto:')
		        displayUrl = '<%=TranslateForScript("/editor/tools/hyperlinkproperties/emailaddress")%> ' + this.GetActiveUrlFieldValue();
	        else
		        displayUrl = this.GetCompleteUrl();
	        if (displayUrl.length == 0)
		        displayUrl = ' ';
	        return displayUrl;
        }
        TabObject.prototype.GetDefaultText = function()
        {
	        if(this.isInternalPageLink)
	        {
		        if (this.InternalPage.value.indexOf('[') > 0)
			        return this.InternalPage.value.substring(0, this.InternalPage.value.indexOf('[') - 1);
		        else
			        return this.InternalPage.value;
	        }
	        else if(this.isInternalDocument)
	        {
		        if (this.GetActiveUrlFieldValue().lastIndexOf('/') > 0)
			        return this.GetActiveUrlFieldValue().substring(this.GetActiveUrlFieldValue().lastIndexOf('/') + 1, this.GetActiveUrlFieldValue().length);
		        else
			        return this.GetActiveUrlFieldValue();
	        }
	        else if(this.activeUrlPrefix == '#')
		        return '#' + this.GetActiveUrlFieldValue();
	        else if(this.activeUrlPrefix == 'mailto:')
		        return this.GetActiveUrlFieldValue();
	        else
		        return this.GetCompleteUrl();
        }
        TabObject.prototype.UseImage = function()
        {
	        return this.ItemTypeImage.checked;
        } 

        function CloneObject(obj, deep)
        {
	        var objectClone = new Object();
        	
	        for (var property in obj)
	        {
		        if (!deep)
			        objectClone[property] = obj[property];
		        else if (typeof obj[property] == 'object')
			        objectClone[property] = CloneObject(obj[property], deep);
		        else
			        objectClone[property] = obj[property];
	        }
         
	        return objectClone;
        }

        var _linkinternalurl;
        var _linkinternalurlname;
        var _linklanguages;
        var _linkexternalurl;
        var _linktitle;
        var _linkframe;
        var _linkitemtypetext;
        var _linkitemtypeimage;
        var _linkdisplaytext;
        var _linkdisplayimage;
        var _linkdisplayimagebutton;
        var _linkanchors;
        var _linktypeinternal;
        var _linktypeexternal;
        var _linktypeanchor;
        var _linkInternalAddressContainer;
        var _linkLanguageContainer;
        var _linkExternalAddressContainer;
        var _linkAnchorContainer;

        var _documentinternalurl;
        var _documentnetworkurl;
        var _documentexternalurl;
        var _documenttitle;
        var _documentframe;
        var _documentitemtypetext;
        var _documentitemtypeimage;
        var _documentdisplaytext;
        var _documentdisplayimage;
        var _documentdisplayimagebutton;
        var _documenttypeinternal;
        var _documenttypenetwork;
        var _documenttypeexternal;
        var _documentInternalAddressContainer;
        var _documentNetworkAddressContainer;
        var _documentExternalAddressContainer;

        var _emailaddress;
        var _emailtitle;
        var _emailitemtypetext;
        var _emailitemtypeimage;
        var _emaildisplaytext;
        var _emaildisplayimage;
        var _emaildisplayimagebutton;

        function Initialize()
        {
            startLink = EPi.GetDialog().dialogArguments;
        	
	        baseHyperlinkImagePropertiesUrl	= startLink.imageDialogUrl;
	        baseFileManagerBrowserUrl		= startLink.fileManagerBrowserUrl;
	        editorID						= startLink.editorID;

            initializeElementReferences();
	        initializeTabObjects();

            if (startLink.href == null || startLink.imageEditingInProgress)
	        {
		        document.getElementById('<%= DeleteButton.ClientID %>').disabled = true;
		    }
		    
            if ('<%= !String.IsNullOrEmpty(Language) %>' === "True") {
                startLink.language = '<%= Language %>';
            }
            
            setDefaultValues();
	        setContentEditVisibility();

	        var errorMessage = '<%= ErrorMessage %>';
	        if (errorMessage != '')
	        {
		        alert(errorMessage);
		        startLink.href = '';
	        }
        }

        function initializeTabObjects()
        {
	        WebPageTab.TabElement		= document.getElementById('<%=WebPagePanel.ClientID%>');
	        WebPageTab.TabIndex			= '0';
	        DocumentTab.TabElement		= document.getElementById('<%=DocumentPanel.ClientID%>');
	        DocumentTab.TabIndex		= '1';
	        EmailTab.TabElement			= document.getElementById('<%=EmailPanel.ClientID%>');
	        EmailTab.TabIndex			= '2';
        	
	        WebPageTab.ItemTypeImage	= _linkitemtypeimage;
	        WebPageTab.TextField		= _linkdisplaytext;
	        WebPageTab.TitleField		= _linktitle;
	        WebPageTab.TargetFrame		= _linkframe;
	        WebPageTab.LanguageList		= _linklanguages;
	        WebPageTab.InternalPage		= _linkinternalurlname;
	        WebPageTab.imageSrcField	= _linkdisplayimage;
	        WebPageTab.linkObject		= CloneObject(startLink);
	        WebPageTab.imageObject		= CloneObject(startLink.imageObject);

	        DocumentTab.ItemTypeImage	= _documentitemtypeimage;
	        DocumentTab.TextField		= _documentdisplaytext;
	        DocumentTab.TitleField		= _documenttitle;
	        DocumentTab.TargetFrame		= _documentframe;
	        DocumentTab.imageSrcField	= _documentdisplayimage;
	        DocumentTab.linkObject		= CloneObject(startLink);
	        DocumentTab.imageObject		= CloneObject(startLink.imageObject);

	        EmailTab.ItemTypeImage		= _emailitemtypeimage;
	        EmailTab.TextField			= _emaildisplaytext;
	        EmailTab.TitleField			= _emailtitle;
	        EmailTab.TargetFrame		= null;
	        EmailTab.imageSrcField		= _emaildisplayimage;
	        EmailTab.linkObject			= CloneObject(startLink);
	        EmailTab.imageObject		= CloneObject(startLink.imageObject);
        }

        // Store away references to all interesting elements, for easy access. 
        // We can not access the elements directly by their id in code, since they live inside a form element.
        function initializeElementReferences()
        {
	        with(document)
	        {
		        // Web page tab settings
		        _linkinternalurl					= getElementById('<%=PageRefFieldId%>');
		        _linkinternalurlname				= getElementById('<%=PageNameFieldId%>');
		        _linklanguages						= getElementById('<%=linklanguages.ClientID %>');
		        _linkexternalurl					= getElementById('linkexternalurl');
		        _linktitle							= getElementById('linktitle');
		        _linkframe							= getElementById('<%=linkframe.ClientID %>');
		        _linkitemtypetext					= getElementById('linkitemtypetext');
		        _linkitemtypeimage					= getElementById('linkitemtypeimage');
		        _linkdisplaytext					= getElementById('linkdisplaytext');
		        _linkdisplayimage					= getElementById('linkdisplayimage');
		        _linkdisplayimagebutton				= getElementById('linkdisplayimagebutton');
		        _linkanchors						= getElementById('linkanchors');
		        _linktypeinternal					= getElementById('<%=linktypeinternal.ClientID %>');
		        _linktypeexternal					= getElementById('<%=linktypeexternal.ClientID %>');
		        _linktypeanchor						= getElementById('<%=linktypeanchor.ClientID %>');
		        _linkInternalAddressContainer		= getElementById('linkInternalAddressContainer');
		        _linkLanguageContainer				= getElementById('linkLanguageContainer');
		        _linkExternalAddressContainer		= getElementById('linkExternalAddressContainer');
		        _linkAnchorContainer				= getElementById('linkAnchorContainer');

		        // Document tab settings
		        _documentinternalurl				= getElementById('documentinternalurl');
		        _documentnetworkurl					= getElementById('documentnetworkurl');
		        _documentexternalurl				= getElementById('documentexternalurl');
		        _documenttitle						= getElementById('documenttitle');
		        _documentitemtypetext				= getElementById('documentitemtypetext');
		        _documentitemtypeimage				= getElementById('documentitemtypeimage');
		        _documentdisplaytext				= getElementById('documentdisplaytext');
		        _documentdisplayimage				= getElementById('documentdisplayimage');
		        _documentdisplayimagebutton			= getElementById('documentdisplayimagebutton');
		        _documentframe						= getElementById('<%=documentframe.ClientID %>');
		        _documenttypeinternal				= getElementById('documenttypeinternal');
		        _documenttypeexternal				= getElementById('documenttypeexternal');
		        _documenttypenetwork				= getElementById('documenttypenetwork');
		        _documentInternalAddressContainer	= getElementById('documentInternalAddressContainer');
		        _documentNetworkAddressContainer	= getElementById('documentNetworkAddressContainer');
		        _documentExternalAddressContainer	= getElementById('documentExternalAddressContainer');
                		
		        // E-mail tab settings
		        _emailaddress						= getElementById('emailaddress');
		        _emailtitle							= getElementById('emailtitle');
		        _emailitemtypetext					= getElementById('emailitemtypetext');
		        _emailitemtypeimage					= getElementById('emailitemtypeimage');
		        _emaildisplaytext					= getElementById('emaildisplaytext');
		        _emaildisplayimage					= getElementById('emaildisplayimage');
		        _emaildisplayimagebutton			= getElementById('emaildisplayimagebutton');
	        }
        }
        
        function setDefaultValues()
        {
            // Preselect values based on current link configuration
	        // Web Page tab
	        setTextBoxValue(_linktitle,				startLink.title);
	        setTextBoxValue(_linkdisplaytext,		EPi.HtmlDecode(startLink.text));
        	
	        if (startLink.imageObject)
		        setTextBoxValue(_linkdisplayimage,		startLink.imageObject.src);
	        if(_linkdisplayimage.value.length > 0)
		        _linkitemtypeimage.checked = true;
	        else if (!startLink.onlyUrl)
		        _linkitemtypetext.checked = true;
        	
        	//Populate the anchor dropdown or hide it if hideBookmarks property is set to true. 
	        if (startLink.hideBookmarks){
	            $(document).ready(function() {  $("input[value=anchor]").parent().hide(); });
	        } else {
	            populateAnchorList(startLink.anchors);
	        }
	        
        	if(startLink.target == "null")
                selectListItem(_linkframe, "");
            else
                selectListItem(_linkframe,		startLink.target);

	        // Document tab
	        setTextBoxValue(_documenttitle,			startLink.title);
	        setTextBoxValue(_documentdisplaytext,	EPi.HtmlDecode(startLink.text));
	        if (startLink.imageObject)
		        setTextBoxValue(_documentdisplayimage,	startLink.imageObject.src);
	        if(_documentdisplayimage.value.length > 0)
		        _documentitemtypeimage.checked = true;
	        else if (!startLink.onlyUrl)
		        _documentitemtypetext.checked = true;
		    if(startLink.target == "null")
		        selectListItem(_documentframe, "");
            else
	            selectListItem(_documentframe,	startLink.target);

	        // E-mail tab
	        setTextBoxValue(_emailtitle,			startLink.title);
	        setTextBoxValue(_emaildisplaytext,		EPi.HtmlDecode(startLink.text));
	        if (startLink.imageObject)
		        setTextBoxValue(_emaildisplayimage,		startLink.imageObject.src);
	        if(_emaildisplayimage.value.length > 0)
		        _emailitemtypeimage.checked = true;
	        else if (!startLink.onlyUrl)
		        _emailitemtypetext.checked = true;

	        // Set default radio buttons
	        _linktypeinternal.checked = true;
	        _documenttypeinternal.checked = true;
        	
	        // Check link type
	        if (startLink.href)
	        {
		        var url = startLink.href;
		        if ('<%=IsInternalDocument%>' == 'True')
		        {	// Internal document
			        if ('<%=DocumentNotFound%>' != 'True' && '<%=DocumentUnauthorizedAccess%>' != 'True')
				        setTextBoxValue(_documentinternalurl, url);
		        }
		        else if ('<%=IsNetworkDocument%>' == 'True')
		        {	// Network document
			        _documenttypenetwork.checked = true;
			        setTextBoxValue(_documentnetworkurl, url);
		        }
		        else if ('<%=IsExternalDocument%>' == 'True')
		        {	// External document
			        _documenttypeexternal.checked = true;
			        setTextBoxValue(_documentexternalurl, url);
		        }
		        else if ('<%=IsMailLink%>' == 'True')
		        {	// Email link
			        setTextBoxValue(_emailaddress, url.substring(7, url.length));
		        }
		        else
		        {	// Web page link
			        if(url != null && url.indexOf('#') == 0)
			        {	// Anchor
				        var currentAnchor = url.substring(1, url.length);
				        _linktypeanchor.checked = true;
				        selectListItem(_linkanchors, currentAnchor);
			        }
			        else if ('<%=IsInternalUrl%>' == 'True')
			        {	// Internal page
				        selectListItem(_linklanguages, startLink.language);
			        }
			        else
			        {	// External page
				        _linktypeexternal.checked = true;
				        setTextBoxValue(_linkexternalurl, url);
			        }
		        }
	        }
	        else if (startLink.onlyUrl)
	        {
		        _linktypeexternal.checked = true;
	        }

	        setImageButtonBehaviour(_linkdisplayimagebutton);
	        setImageButtonBehaviour(_documentdisplayimagebutton);
	        setImageButtonBehaviour(_emaildisplayimagebutton);

	        setImageToolAvailability();
	        setEnabledState();
	        setFieldVisibility();
        }

        function setFieldVisibility()
        {
	        // Web page tab
	        if(_linktypeanchor.checked)
	        {	// Anchor
		        _linkAnchorContainer.style.display = 'block';
		        _linkInternalAddressContainer.style.display = 'none';
		        _linkLanguageContainer.style.display = 'none';
		        _linkExternalAddressContainer.style.display = 'none';
		        WebPageTab.activeUrlField		= _linkanchors;
		        WebPageTab.activeUrlPrefix		= '#';
		        WebPageTab.isInternalPageLink	= false;
	        }
	        else if (_linktypeinternal.checked)
	        {	// Internal page
		        _linkInternalAddressContainer.style.display = 'block';
		        _linkLanguageContainer.style.display = <%=Settings.Instance.UIShowGlobalizationUserInterface ? "'block'" : "startLink.language!=null ? 'block' : 'none'"%>;
		        _linkAnchorContainer.style.display = 'none';
		        _linkExternalAddressContainer.style.display = 'none';
		        WebPageTab.activeUrlField		= _linkinternalurl;
		        WebPageTab.activeUrlPrefix		= '';
		        WebPageTab.isInternalPageLink	= true;
	        }
	        else if (_linktypeexternal.checked)
	        {	// External page
		        _linkExternalAddressContainer.style.display = 'block';
		        _linkAnchorContainer.style.display = 'none';
		        _linkInternalAddressContainer.style.display = 'none';
		        _linkLanguageContainer.style.display = 'none';
		        WebPageTab.activeUrlField		= _linkexternalurl;
		        WebPageTab.activeUrlPrefix		= '';
		        WebPageTab.isInternalPageLink	= false;
	        }

	        // Document tab
	        if (_documenttypeinternal.checked)
	        {	// Internal document
		        _documentInternalAddressContainer.style.display = 'block';
		        _documentNetworkAddressContainer.style.display = 'none';
		        _documentExternalAddressContainer.style.display = 'none';
		        DocumentTab.activeUrlField		= _documentinternalurl;
		        DocumentTab.activeUrlPrefix		= '';
		        DocumentTab.isInternalDocument	= true;
	        }
	        else if(_documenttypenetwork.checked)
	        {	// Network document
		        _documentNetworkAddressContainer.style.display = 'block';
		        _documentExternalAddressContainer.style.display = 'none';
		        _documentInternalAddressContainer.style.display = 'none';
		        DocumentTab.activeUrlField		= _documentnetworkurl;
		        DocumentTab.activeUrlPrefix		= '';
		        DocumentTab.isInternalDocument	= false;
	        }
	        else if(_documenttypeexternal.checked)
	        {	// External document
		        _documentExternalAddressContainer.style.display = 'block';
		        _documentNetworkAddressContainer.style.display = 'none';
		        _documentInternalAddressContainer.style.display = 'none';
		        DocumentTab.activeUrlField		= _documentexternalurl;
		        DocumentTab.activeUrlPrefix		= '';
		        DocumentTab.isInternalDocument	= false;
	        }

	        // Email tab
	        EmailTab.activeUrlField	= _emailaddress;
	        EmailTab.activeUrlPrefix = 'mailto:';
        }

        function setEnabledState()
        {	
	        if (startLink.onlyUrl)
	        {
		        document.getElementById("fieldset_information").style.display = "none";
		        document.getElementById("fieldset_doc_information").style.display = "none";
		        document.getElementById("fieldset_email_information").style.display = "none";
		        
		        setImageButtonEnabled(_linkdisplayimagebutton, false);
		        _linkitemtypeimage.disabled				= true;
		        _linkitemtypetext.disabled				= true;
		        _linkdisplaytext.disabled				= true;
		        _linktitle.disabled						= true;
		        _linkframe.disabled						= true;
		        _linktypeanchor.disabled				= true;
		        if (WebPageTab.IsActive())
			        _linkexternalurl.focus();
		        setImageButtonEnabled(_documentdisplayimagebutton, false);
		        _documentitemtypeimage.disabled			= true;
		        _documentitemtypetext.disabled			= true;
		        _documentdisplaytext.disabled			= true;
		        _documenttitle.disabled					= true;
		        _documentframe.disabled					= true;
		        if (DocumentTab.IsActive())
		        {
			        if (_documenttypeexternal.checked)
				        _documentexternalurl.focus();
			        else if (_documenttypenetwork.checked)
				        _documentnetworkurl.focus();
		        }
		        setImageButtonEnabled(_emaildisplayimagebutton, false);
		        _emailitemtypeimage.disabled			= true;
		        _emailitemtypetext.disabled				= true;
		        _emaildisplaytext.disabled				= true;
		        _emailtitle.disabled					= true;
		        if (EmailTab.IsActive())
			        _emailaddress.focus();
	        }
	        else if (!isImageToolAvailable)
	        {
		        setImageButtonEnabled(_linkdisplayimagebutton, false);
		        _linkitemtypeimage.disabled				= true;
		        setImageButtonEnabled(_documentdisplayimagebutton, false);
		        _documentitemtypeimage.disabled			= true;
		        setImageButtonEnabled(_emaildisplayimagebutton, false);
		        _emailitemtypeimage.disabled			= true;
	        }
	        else if (startLink.imageEditingInProgress)
	        {
		        setImageButtonEnabled(_linkdisplayimagebutton, false);
		        _linkitemtypetext.disabled				= true;
		        _linkdisplaytext.disabled				= true;
		        if (WebPageTab.IsActive())
			        _linktitle.focus();
		        setImageButtonEnabled(_documentdisplayimagebutton, false);
		        _documentitemtypetext.disabled			= true;
		        _documentdisplaytext.disabled			= true;
		        if (DocumentTab.IsActive())
			        _documenttitle.focus();
		        setImageButtonEnabled(_emaildisplayimagebutton, false);
		        _emailitemtypetext.disabled				= true;
		        _emaildisplaytext.disabled				= true;
		        if (EmailTab.IsActive())
			        _emailtitle.focus();
	        }
	        else
	        {
		        if (_linkitemtypeimage.checked)
		        {
			        setImageButtonEnabled(_linkdisplayimagebutton, true);
			        _linkdisplaytext.disabled				= true;
			        if (WebPageTab.IsActive())
				        _linktitle.focus();
		        }
		        else
		        {
			        setImageButtonEnabled(_linkdisplayimagebutton, false);
			        _linkdisplaytext.disabled				= false;
			        if (WebPageTab.IsActive())
				        _linkdisplaytext.focus();
		        }
        		
		        if (_documentitemtypeimage.checked)
		        {
			        setImageButtonEnabled(_documentdisplayimagebutton, true);
			        _documentdisplaytext.disabled			= true;
			        if (DocumentTab.IsActive())
				        _documenttitle.focus();
		        }
		        else
		        {
			        setImageButtonEnabled(_documentdisplayimagebutton, false);
			        _documentdisplaytext.disabled			= false;
			        if (DocumentTab.IsActive())
				        _documentdisplaytext.focus();
		        }
        		
		        if (_emailitemtypeimage.checked)
		        {
			        setImageButtonEnabled(_emaildisplayimagebutton, true);
			        _emaildisplaytext.disabled			= true;
			        if (EmailTab.IsActive())
				        _emailtitle.focus();
		        }
		        else
		        {
			        setImageButtonEnabled(_emaildisplayimagebutton, false);
			        _emaildisplaytext.disabled			= false;
			        if (EmailTab.IsActive())
				        _emaildisplaytext.focus();
		        }
	        }
        }

        function setImageButtonBehaviour(img)
        {
	        img.onmouseover = setImageSrc;
	        img.onmousedown = setImageSrc;
	        img.onmouseout	= setImageSrc;
	        img.onmouseup	= setImageSrc;
        }

        function setImageButtonEnabled(img, enabled)
        {
	        img.disabled = !enabled;
	        if(enabled)
		        img.src			= '<%=this.GetImageThemeUrl("Editor/image_off.gif") %>';
	        else
		        img.src			= '<%=this.GetImageThemeUrl("Editor/image_disabled.gif") %>';
        }

        function setImageSrc(ev) {
            var e = window.event ? window.event : ev;
            var srcEl = e.srcElement ? e.srcElement : e.target;
	        if (srcEl.disabled)
		        return;
        		
	        switch (e.type)
	        {
		        case 'mouseover':
			        srcEl.src='<%=this.GetImageThemeUrl("Editor/image_over.gif") %>';
			        break;
		        case 'mousedown':
			        srcEl.src='<%=this.GetImageThemeUrl("Editor/image_selected.gif") %>';
			        break;
		        case 'mouseout':
			        srcEl.src='<%=this.GetImageThemeUrl("Editor/image_off.gif") %>';
			        break;
		        case 'mouseup':
			        srcEl.src='<%=this.GetImageThemeUrl("Editor/image_over.gif") %>';
			        break;
	        }
        }

        function populateAnchorList(anchorArray)
        {
	        var newOption;
        	
	        // Create an empty entry at the beginning of the list
	        newOption = document.createElement("OPTION");
	        
	        AddOptionToSelectList(_linkanchors, newOption);
	        
	        // Find all anchors in the anchor array
	        if (anchorArray)
	        {
		        for (var i = 0; i < anchorArray.length; i++)
		        {
			        newOption = document.createElement("OPTION");
			        if (anchorArray[i].length > 40)
			        {
				        newOption.text	= anchorArray[i].substr(0,40) + '...';
			        }
			        else
				    {
				        newOption.text	= anchorArray[i];
			        }
			        newOption.value	= anchorArray[i];
			        
			        AddOptionToSelectList(_linkanchors, newOption);
		        }
	        }
        }
        
        

        function selectListItem(list, itemValue)
        {
	        if(!itemValue)
	        {
		        list.selectedIndex = 0;
		        return;
	        }
	        for(i = 0; i < list.length; i++)
	        {
		        if(list.options[i].value == itemValue)
		        {
			        list.selectedIndex = i;
			        return;
		        }
	        }
	        // A value has been set, but was not found in the list. Create a (temporary) list item for the
	        // value, to avoid clearing values set in HTML-mode by just opening and closing the dialog.
	        var newOption	= document.createElement("OPTION");
	        newOption.text	= itemValue;
	        newOption.value	= itemValue;
	        
	        AddOptionToSelectList(list, newOption)
	        
	        list.selectedIndex = list.options.length-1;
        }
        function setTextBoxValue(textBox, value)
        {
	        if(!value)
		        value = '';
	        textBox.value = value;
        }
        function buildReturnValue()
        {
	        // For all return values - if they are empty/cleared/undefined, pass back null.
	        var returnValue = startLink;
        	
	        returnValueValidationErrorMessage = null;

	        var activeTab = GetActiveTab();
	        
	        document.getElementById('<%=activeTab.ClientID%>').value = activeTab.TabIndex;
        	
	        returnValue.href			= activeTab.GetCompleteUrl();
	        returnValue.displayUrl		= activeTab.GetDisplayUrl();
	        
	        if (returnValue.href.Trim().length == 0 || returnValue.href == "0")
	        {	
		        returnValueValidationErrorMessage = '<%=TranslateForScript("/editor/tools/hyperlinkproperties/nourlvalidationmessage")%>';
	        }
	        else
	        {
		         if (activeTab.activeUrlField === _linkexternalurl && _linkexternalurl.value.indexOf(":") < 0) {
		            if (!confirm('<%=TranslateForScript("/editor/tools/hyperlinkproperties/protocolmissingvalidationmessage")%>')) {
		                return false;
		            }
		        }
		        
		        returnValue.isUpdated		= true;
		        returnValue.title			= activeTab.TitleField.value;
		        returnValue.target			= activeTab.TargetFrame != null ? activeTab.TargetFrame[activeTab.TargetFrame.selectedIndex].value : null;
		        
		        if(activeTab.UseImage())
		        {	// Linked image, do not use text
			        returnValue.text		= null;
			        returnValue.imageObject	= activeTab.imageObject;
			        if (!returnValue.imageEditingInProgress && (returnValue.imageObject.src == null || returnValue.imageObject.src.Trim().length == 0))
			        {
				        returnValueValidationErrorMessage = '<%=TranslateForScript("/editor/tools/hyperlinkproperties/noimageinfovalidationmessage")%>' + '\n\n' + 
							        '<%=TranslateForScript("/editor/tools/hyperlinkproperties/specifyimagemessage")%>';
			        }
		        }
		        else
		        {	// Linked text, do not use image
			        if(activeTab.TextField.value.Trim().length > 0)
			        {
				        returnValue.text = activeTab.TextField.value.Trim();
			        }
			        else // Provide a default text for the link
			        {
				        returnValue.text = activeTab.GetDefaultText();
			        }
			        returnValue.imageObject	= null;
		        }
	        }
            
	        if (returnValueValidationErrorMessage != null)
	        {		            
	            alert(returnValueValidationErrorMessage);
		        return false;
	        }
	        
            return returnValue;	
        }
        
        function LaunchHyperlinkImagePropertiesWindow(element)
        {
	        if (element.disabled) {
	            return;
	        }
	        var returnValue;
	        var dialogUrl = baseHyperlinkImagePropertiesUrl;
        	
	        var currentTab = GetActiveTab();
	        currentTab.imageObject.linkEditingInProgress = true;
	        // Update the current tab's linkObject to reflect the entered URL
	        currentTab.linkObject.displayUrl = currentTab.GetDisplayUrl();
	        currentTab.imageObject.linkObject = currentTab.linkObject;
        	
        	
	        var onCompleteArguments = new Object();
	        onCompleteArguments.imageObject = currentTab.imageObject;
	        onCompleteArguments.imageSrcField = currentTab.imageSrcField;
        	var dialogWidth = <%= EPiServerSection.Instance.ImageEditorSettings.WindowWidth %>;
        	var dialogHeight = <%= EPiServerSection.Instance.ImageEditorSettings.WindowHeight %>;
        	
	        EPi.CreateDialog(dialogUrl, OnHyperLinkImageDialogClose, onCompleteArguments, {src: currentTab.imageObject.src, imageAttributes: currentTab.imageObject}, {width: dialogWidth ,height: dialogHeight, scrollbars:"no"});
        }

        function OnHyperLinkImageDialogClose(returnValue, onCompleteArguments)
        {
            if (returnValue)
            {
                onCompleteArguments.imageObject = returnValue;
                onCompleteArguments.imageSrcField.value = returnValue.src;
            }
        }

        function OkClick()
        {	
	        // The ok button makes a postback but we start building the dialog returnvalue here
	        // and finish it in the postback, where we also close the dialog.	        	        	        
	        var returnValue = buildReturnValue();
	        // If we don't have a returnValue we return false to prevent the form from getting posted.
	        if (!returnValue)
	        {
	            return false;    
	        }
	        EPi.GetDialog().returnValue = returnValue;
	        return true;
	    }

        function DeleteClick()
        {
            //We need to set page changed to false since this method is called before the document
            //can decide if the button allows page leave without confirm.
            EPi.PageLeaveCheck.SetPageChanged(false);
            var returnValue = "-1";
            EPi.GetDialog().Close(returnValue);
        }

        function CancelClick()
        {
            //We need to set page changed to false since this method is called before the document
            //can decide if the button allows page leave without confirm.
            EPi.PageLeaveCheck.SetPageChanged(false);
	        EPi.GetDialog().Close();
        }
        
        // Helper method for adding option elements to a select list
        function AddOptionToSelectList(selectNode, optionNode)
        {
            //TODO: Find a way to make this firefox/ie friendly.
		    try
		    {
		        // IE way
		       selectNode.add(optionNode);
		    }
		    catch(ex)
		    {
		        // DOM level 2
		       selectNode.add(optionNode, null);
		    }
        }
        
        // ]]>
    </script>

</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="FullRegion" runat="server">
<EPiServerUI:BodySettings runat="server" CssClass="epiemptybackground" />
<div class="epi-smallPadddingVertical">

<EPiServerUI:TabStrip id="actionTab" runat="server" GeneratesPostBack="false" TargetID="tabView">
	<EPiServerUI:Tab Text="/editor/tools/hyperlinkproperties/tabs/webpage" runat="server" id="WebPageTab"/>
	<EPiServerUI:Tab Text="/editor/tools/hyperlinkproperties/tabs/document" runat="server" id="DocumentTab"/>
	<EPiServerUI:Tab Text="/editor/tools/hyperlinkproperties/tabs/email" runat="server" id="EmailTab"/>
</EPiServerUI:TabStrip>

<asp:panel id="tabView" runat="server" CssClass="epi-padding-small epi-formArea">

	<!---------------- WEB PAGE TAB ---------------->
	<asp:Panel id="WebPagePanel"  runat="server" >
		<!------------------------->
		<!-- INFORMATION SECTION -->
		<!------------------------->
		<fieldset id="fieldset_information">
			<legend><%=Translate("/editor/tools/hyperlinkproperties/informationheading")%>&nbsp;</legend>

			<!-- Display Text -->
			<div class="epi-size10">
			    <div>
			        <label for="linkitemtypetext">
			            <input id="linkitemtypetext" name="linkitemtype" type="radio" onclick="setEnabledState()" value="text" />
			            <%=Translate("/editor/tools/hyperlinkproperties/clickabletext")%>
			        </label>
			        <input id="linkdisplaytext" class="episize240" type="text" />
			    </div>

			    <!-- Display Image -->
			    <div>
			        <label for="linkitemtypeimage">
			            <input id="linkitemtypeimage" name="linkitemtype" type="radio" onclick="setEnabledState()" value="image" />
			            <%=Translate("/editor/tools/hyperlinkproperties/clickableimage")%>
			        </label>
				    <input id="linkdisplayimage" type="text" disabled="disabled" /><input class="epiimagebutton" type="image" id="linkdisplayimagebutton" onclick="LaunchHyperlinkImagePropertiesWindow(this); return false;" src='<%=this.GetImageThemeUrl("Editor/image_off.gif")%>' title="<%=Translate("/editor/tools/hyperlinkproperties/editimageproperties")%>" alt="<%=Translate("/editor/tools/hyperlinkproperties/editimageproperties")%>"/>
			    </div>

			    <!-- Link Title -->
			    <div>
				    <label for="linktitle">
				        <%=Translate("/editor/tools/hyperlinkproperties/linktitle")%>
				    </label>
				    <input id="linktitle" type="text" />
			    </div>

			    <!-- Target Frame -->
		        <div>
		            <label for="<%=linkframe.ClientID %>">
		                <%=Translate("/editor/tools/hyperlinkproperties/targetframe")%>
		            </label>
			        <asp:DropDownList ID="linkframe" Runat="server" />
			    </div>
			</div>
		</fieldset>
		<!------------------>
		<!-- LINK SECTION -->
		<!------------------>
		<fieldset id="fieldset_link">
			<legend><%=Translate("/editor/tools/hyperlinkproperties/linktargetheading")%>&nbsp;</legend>

			<!-- Internal Link -->
			<div class="epirowcontainer">
				<input id="linktypeinternal" name="linktype" type="radio" onclick="setFieldVisibility()" value="internal" runat="server" />
				<asp:Label runat="server" AssociatedControlID="linktypeinternal" Text="<%$ Resources:EPiServer, editor.tools.hyperlinkproperties.internallink %>" />
			</div>
			
			<!-- External Link -->
			<div class="epirowcontainer">
				<input id="linktypeexternal" name="linktype" type="radio" onclick="setFieldVisibility()" value="external" runat="server" />
				<asp:Label runat="server" AssociatedControlID="linktypeexternal" Text="<%$ Resources:EPiServer, editor.tools.hyperlinkproperties.externallink %>" />
			</div>
			
			<!-- Anchor Link -->
			<div class="epirowcontainer">
				<input id="linktypeanchor" name="linktype" type="radio" onclick="setFieldVisibility()" value="anchor" runat="server" />
				<asp:Label runat="server" AssociatedControlID="linktypeanchor" Text="<%$ Resources:EPiServer, editor.tools.hyperlinkproperties.anchorlink %>" />
			</div>

			<!-- Internal Address -->
			<div class="epirowcontainer" id="linkInternalAddressContainer">
				<asp:Label AssociatedControlID="linkinternalurl" CssClass="episize100 epiindent" Text="<%$ Resources:EPiServer, editor.tools.hyperlinkproperties.address %>" runat="server" />
				<EPiServer:InputPageReference runat="server" id="linkinternalurl" RequireUrlForSelectedPage="true" style="display:inline;" />
			</div>

			<!-- Language List -->
			<div class="epirowcontainer" id="linkLanguageContainer">
				<asp:Label AssociatedControlID="linklanguages" CssClass="episize100 epiindent" Text="<%$ Resources:EPiServer, editor.tools.hyperlinkproperties.language %>" runat="server" />
				<asp:DropDownList id="linklanguages" Runat="server" />
			</div>

			<!-- External Address --> 
			<div class="epirowcontainer" id="linkExternalAddressContainer">
				<label for="linkexternalurl" class="episize100 epiindent"><%=Translate("/editor/tools/hyperlinkproperties/address")%></label>
				<input id="linkexternalurl" class="episize240" type="text" value="http://" />
			</div>
			
			<!-- Anchor List -->
			<div class="epirowcontainer" id="linkAnchorContainer">
				<label for="linkanchors" class="episize100 epiindent"><%=Translate("/editor/tools/hyperlinkproperties/anchor")%></label>
				<select id="linkanchors" class="episize240">
				</select>
			</div>
		</fieldset>
	</asp:Panel>

	<!---------------- DOCUMENT TAB ---------------->
	<asp:Panel ID="DocumentPanel" runat="server" >
		<!------------------------->
		<!-- INFORMATION SECTION -->
		<!------------------------->
		<fieldset id="fieldset_doc_information">
			<legend><%=Translate("/editor/tools/hyperlinkproperties/informationheading")%>&nbsp;</legend>

			<!-- Display Text -->
			<div class="epirowcontainer">
				<input id="documentitemtypetext" name="documentitemtype" type="radio" onclick="setEnabledState()" value="text" />
				<label class="episize100" for="documentitemtypetext"><%=Translate("/editor/tools/hyperlinkproperties/clickabletext")%></label>
				<input id="documentdisplaytext" class="episize240" type="text" />
			</div>

			<!-- Display Image -->
			<div class="epirowcontainer">
				<input id="documentitemtypeimage" name="documentitemtype" type="radio" onclick="setEnabledState()" value="image" />
				<label class="episize100" for="documentitemtypeimage"><%=Translate("/editor/tools/hyperlinkproperties/clickableimage")%></label>
				<input id="documentdisplayimage" class="episize240" type="text" disabled="disabled" />
				<img style="vertical-align:bottom;" id="documentdisplayimagebutton" onclick="LaunchHyperlinkImagePropertiesWindow(this);" src='<%=this.GetImageThemeUrl("Editor/image_off.gif")%>' title="<%=Translate("/editor/tools/hyperlinkproperties/editimageproperties")%>" alt="<%=Translate("/editor/tools/hyperlinkproperties/editimageproperties")%>" />
			</div>

			<!-- Link Title -->
			<div class="epirowcontainer">
				<label for="documenttitle" class="episize100 epiindent"><%=Translate("/editor/tools/hyperlinkproperties/linktitle")%></label>
				<input id="documenttitle" class="episize240" type="text" />
			</div>

			<!-- Target Frame -->
			<div class="epirowcontainer">
			    <asp:Label CssClass="episize100 epiindent" AssociatedControlID="documentframe" Text="<%$ Resources: EPiServer, editor.tools.hyperlinkproperties.targetframe %>" runat="server"/>
				<asp:DropDownList id="documentframe" Runat="server" />
			</div>
		</fieldset>
		<!------------------>
		<!-- LINK SECTION -->
		<!------------------>
		<fieldset id="fieldset_doc_link">
			<legend><%=Translate("/editor/tools/hyperlinkproperties/linktargetheading")%>&nbsp;</legend>

			<!-- Internal Document Link -->
			<div class="epirowcontainer">
				<input id="documenttypeinternal" name="documenttype" type="radio" onclick="setFieldVisibility()" value="internaldocument" />
				<label for="documenttypeinternal"><%=Translate("/editor/tools/hyperlinkproperties/internaldocumentlink")%></label>
			</div>
			
			<!-- Network Document Link -->
			<div class="epirowcontainer">
				<input id="documenttypenetwork" name="documenttype" type="radio" onclick="setFieldVisibility()" value="externaldocument" />
				<label for="documenttypenetwork"><%=Translate("/editor/tools/hyperlinkproperties/networkdocumentlink")%></label>
			</div>
			
			<!-- External Document Link -->
			<div class="epirowcontainer">
				<input id="documenttypeexternal" name="documenttype" type="radio" onclick="setFieldVisibility()" value="externaldocument" />
				<label for="documenttypeexternal"><%=Translate("/editor/tools/hyperlinkproperties/externaldocumentlink")%></label>
			</div>
			
			<!-- Internal Address -->
			<div class="epirowcontainer" id="documentInternalAddressContainer">
				<label for="documentinternalurl" class="episize100 epiindent"><%=Translate("/editor/tools/hyperlinkproperties/path")%></label>
				<input id="documentinternalurl" class="episize240" type="text" />
			</div>
			
			<!-- Network Address -->
			<div class="epirowcontainer" id="documentNetworkAddressContainer">
				<label for="documentnetworkurl" class="episize100 epiindent"><%=Translate("/editor/tools/hyperlinkproperties/path")%></label>
				<input id="documentnetworkurl" class="episize240" type="text" value="file://" />
			</div>
			
			<!-- External Address -->
			<div class="epirowcontainer" id="documentExternalAddressContainer">
				<label for="documentexternalurl" class="episize100 epiindent"><%=Translate("/editor/tools/hyperlinkproperties/path")%></label>
				<input id="documentexternalurl" class="episize240" type="text" value="http://" />
			</div>
		</fieldset>
	</asp:Panel>

	<!---------------- E-MAIL TAB ---------------->
	<asp:Panel id="EmailPanel"  runat="server" >
		<!------------------------->
		<!-- INFORMATION SECTION -->
		<!------------------------->
		<fieldset id="fieldset_email_information">
			<legend><%=Translate("/editor/tools/hyperlinkproperties/informationheading")%>&nbsp;</legend>

			<!-- Display Text -->
			<div class="epirowcontainer">
				<input id="emailitemtypetext" name="emailitemtype" type="radio" onclick="setEnabledState()" value="text" />
				<label for="emailitemtypetext" class="episize100"><%=Translate("/editor/tools/hyperlinkproperties/clickabletext")%></label>
				<input id="emaildisplaytext" class="episize240" type="text" />
			</div>

			<!-- Display Image -->
			<div class="epirowcontainer">
				<input id="emailitemtypeimage" name="emailitemtype" type="radio" onclick="setEnabledState()" value="image" />
				<label for="emailitemtypeimage" class="episize100"><%=Translate("/editor/tools/hyperlinkproperties/clickableimage")%></label>
				<input id="emaildisplayimage" class="episize240" type="text" disabled="disabled"/>
				<img style="vertical-align:bottom;" id="emaildisplayimagebutton" onclick="LaunchHyperlinkImagePropertiesWindow(this);" src='<%=this.GetImageThemeUrl("Editor/image_off.gif")%>' title="<%=Translate("/editor/tools/hyperlinkproperties/editimageproperties")%>"  alt="<%=Translate("/editor/tools/hyperlinkproperties/editimageproperties")%>"/>
			</div>

			<!-- Link Title -->
			<div class="epirowcontainer">
				<label for="emailtitle" class="episize100 epiindent"><%=Translate("/editor/tools/hyperlinkproperties/linktitle")%></label>
				<input id="emailtitle" class="episize240" type="text" />
			</div>
		</fieldset>
		<!------------------>
		<!-- LINK SECTION -->
		<!------------------>
		<fieldset id="fieldset_email_link">
			<legend><%=Translate("/editor/tools/hyperlinkproperties/linktargetheading")%>&nbsp;</legend>

			<!-- Address -->
			<div class="epirowcontainer">
				<label for="emailaddress" class="episize100 epiindent"><%=Translate("/editor/tools/hyperlinkproperties/emailaddress")%></label>
				<input id="emailaddress" class="episize240" type="text" />
			</div>
		</fieldset>
	</asp:Panel>

</asp:Panel>
<!-------------------->
<!-- FOOTER SECTION -->
<!-------------------->
<div class="epi-padding-footer" >
	<EPiServerUI:ToolButton IsDialogButton="true" OnClientClick="return OkClick();" ID="OkButton" Text="<%$ Resources:EPiServer, button.ok %>" ToolTip="<%$ Resources:EPiServer, button.ok %>" runat="server" />
	<EPiServerUI:ToolButton IsDialogButton="true" ID="DeleteButton" OnClientClick="DeleteClick();" GeneratesPostBack="false" Text="<%$ Resources:EPiServer, button.delete %>" ToolTip="<%$ Resources:EPiServer, button.delete %>" runat="server" DisablePageLeaveCheck="true" />
	<EPiServerUI:ToolButton IsDialogButton="true" OnClientClick="CancelClick();" GeneratesPostBack="false" Text="<%$ Resources:EPiServer, button.cancel %>" ToolTip="<%$ Resources:EPiServer, button.cancel %>" DisablePageLeaveCheck="true" runat="server" />
	<input id="activeTab" type="hidden" runat="server" value="" />
	<input id="disablePageBrowserSelfLinkButton" type="hidden" value="true" />
</div>

</div>

</asp:Content>