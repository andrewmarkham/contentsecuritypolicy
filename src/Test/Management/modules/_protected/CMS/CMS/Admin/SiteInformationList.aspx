<%@ Page Language="c#"  EnableEventValidation="false" Codebehind="SiteInformationList.aspx.cs" AutoEventWireup="false" Inherits="EPiServer.UI.Admin.SiteInformationList"  Title="siteAndLicenseinformation" %>
<%@ Import Namespace="EPiServer.Licensing.Services"%>
<asp:Content ID="ContentForMainRegion" ContentPlaceHolderID="MainRegion" runat="server">
<div class="epi-buttonDefault">
    <EPiServerUI:ToolButton id="AddSite" OnClick="AddSite_Click" runat="server" text="<%$ Resources: EPiServer, admin.siteinformationlist.addsite %>" ToolTip="<%$ Resources: EPiServer, admin.siteinformationlist.addsite %>" SkinID="Add" />    
</div>

<EPiServerUI:TabStrip runat="server" id="actionTab" GeneratesPostBack="true" targetid="tabView">
	<EPiServerUI:Tab Text="<%$ Resources: EPiServer, admin.siteinformationlist.tabsites %>" runat="server" ID="WebSitesTab" />
	<EPiServerUI:Tab Text="<%$ Resources: EPiServer, admin.siteinformationlist.tabcloudlicense%>" runat="server" ID="CloudSitesTab"  />
</EPiServerUI:TabStrip>
<asp:Panel runat="server" ID="tabView" CssClass="epi-padding">
        <div class="epi-formArea" ID="SiteInfo" runat="server">
            <asp:GridView
	            ID="SiteList"
	            Runat="server"
	            AutoGenerateColumns="false">
                <Columns>
	                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.siteinformationlist.sitename %>">
		                <ItemTemplate>
			                <a href="SiteInformationEdit.aspx?siteId=<%# DataBinder.Eval(Container.DataItem, "Id") %>"><%#: DataBinder.Eval(Container.DataItem, "Name")%></a>
		                </ItemTemplate>
	                </asp:TemplateField>
                    <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.siteinformationlist.siteurl %>">
		                <ItemTemplate>
			                <a href="<%#DataBinder.Eval(Container.DataItem, "SiteUrl")%>" target="_top"><%# DataBinder.Eval(Container.DataItem, "SiteUrl")%></a>
		                </ItemTemplate>
	                </asp:TemplateField>
                </Columns>
            </asp:GridView>
        </div>
        <div class="epi-formArea" ID="CloudLicensesInfo" runat="server">
           <div style="padding-bottom: 10px;"><asp:Label runat="server" ID="CloudLicenseInfoText"></asp:Label></div>
            <asp:GridView
	            ID="CloudLicenses"
	            Runat="server"
	            AutoGenerateColumns="false"
                ShowHeaderWhenEmpty="true">

                <Columns>
                    <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.siteinformationlist.siteurl %>">
		                <ItemTemplate>
			                <a href="<%#DataBinder.Eval(Container.DataItem, "SiteUrl")%>" target="_top"><%# DataBinder.Eval(Container.DataItem, "SiteUrl")%></a>
		                </ItemTemplate>
	                </asp:TemplateField>

                    <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.siteinformationlist.runat %>">
		                <ItemTemplate>
			               	<div style="width: 100%;text-align: center" title="<%# GetServersTooltip((Uri)Eval("SiteUrl"))%>"><%# GetServerCount((Uri)Eval("SiteUrl"))%></div>
		                </ItemTemplate>
	                </asp:TemplateField>

                    <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.siteinformationlist.changed %>">
		                <ItemTemplate>
			               	<%# GetChangedFormat((DateTime)Eval("Changed"))%>
		                </ItemTemplate>
	                </asp:TemplateField>

                    <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.siteinformationlist.changedby %>">
		                <ItemTemplate>
			                <%#: DataBinder.Eval(Container.DataItem, "ChangedBy")%>
		                </ItemTemplate>
	                </asp:TemplateField>


	                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, admin.siteinformationlist.action %>">
		                <ItemTemplate>
                            <EPiServerUI:ToolButton width="100" CommandArgument='<%# Eval("SiteUrl") %>' onclick="ActivateCloudSite_Click" ID="ActivateLicense" runat="server" EnableClientConfirm="true" ConfirmMessage="<%$ Resources: EPiServer, admin.siteinformationlist.activatelicenseconfirm%>" SkinID="Save" Text="<%$ Resources: EPiServer, admin.siteinformationlist.activatelicense%>" ToolTip="<%$ Resources: EPiServer, admin.siteinformationlist.activatelicensetooltip %>"  visible=<%# Eval("Status").ToString() == "inactive"%>  />
                            <EPiServerUI:ToolButton width="100" CommandArgument='<%# Eval("SiteUrl") %>' onclick="DeactivateCloudSite_Click"  ID="DeactivateCloudWebsite" runat="server" EnableClientConfirm="true" ConfirmMessage="<%$ Resources: EPiServer, admin.siteinformationlist.deactivatelicenseconfirm%>"  SkinID="Delete" Text="<%$ Resources: EPiServer, admin.siteinformationlist.deactivatelicense%>" ToolTip="<%$ Resources: EPiServer, admin.siteinformationlist.deactivelicensetooltip %>"  visible=<%# (Eval("Status").ToString() == "active" )%> />
                        </ItemTemplate>
	                </asp:TemplateField>
                </Columns>
            </asp:GridView>
        </div>
</asp:Panel>
</asp:Content>
