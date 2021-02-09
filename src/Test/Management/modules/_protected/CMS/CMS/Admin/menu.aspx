<%@ Page Language="c#" Codebehind="menu.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.Menu"  Title="Menu" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
    <base target="ep_main" />
</asp:Content>
<asp:Content ContentPlaceHolderID="FullRegion" runat="server">
    <EPiServerUI:BodySettings CssClass="epi-applicationSidebar" runat="server" />

    <script type="text/javascript">
        function Sort(order, listElementId) {
            var listElement = $('#' + listElementId);
            var listItems = $("li", listElement);

            var arr = $.map(listItems, function (li, index) {
                return { item: li, title: $("a", li).attr("title"), index: parseInt($("a", li).attr("id")) };  
            });

            switch (order) {
                case 'index':
                    arr.sort(function (a, b) {
                        var result = Compare(a.index, b.index);
                        return result === 0 ? Compare(a.title.toLowerCase(), b.title.toLowerCase()) : result;
                    });
                    break;
                case 'alphabetical':
                    arr.sort(function (a, b) { return Compare(a.title.toLowerCase(), b.title.toLowerCase()); });
                    break;
            }

            for (var i = 0; i < arr.length; i++) {
                listElement.append(arr[i].item);
            }
        }

        function Compare(a, b) {
            if (a > b) {
                return 1;
            }
            else if (a == b) {
                return 0;
            }
            else {
                return -1;
            }
        }

	</script>
    <script type="text/javascript">
        $(document).ready(function () {
            var storagePrefix = 'EPiAdmin';
            var on = function (e) {
                $(this).closest("li").removeClass("epi-settings-closed");
                $(this).siblings(".EPAdmin-menuTypeSorting").show();
            };
            var off = function (e) {
                $(this).closest("li").addClass("epi-settings-closed");
                $(this).siblings(".EPAdmin-menuTypeSorting").hide();
            };
            $(".epi-localNavigation > ul > li > a").toggle(off, on);

            $(".EPAdmin-menuTypeSorting > img").click(function () {
                if ($(this).hasClass("EPEdit-CommandTool")) {
                    $(this).removeClass("EPEdit-CommandTool").addClass("EPEdit-CommandToolClicked");
                    $(this).siblings().removeClass("EPEdit-CommandToolClicked").addClass("EPEdit-CommandTool");
                }
                var order = $(this).attr("data-order");
                var list = $(this).attr("data-list");
                if (order && list) {
                    Sort(order, list);
                }
                if (localStorage !== undefined) {
                    localStorage.setItem(storagePrefix + list + 'Sort', $(this).attr("id"));
                }
            });

            if (localStorage !== undefined) {
                var pageTypeSort = localStorage.getItem(storagePrefix+"PageTypesSort");
                if (pageTypeSort) {
                    $('#' + pageTypeSort).click();
                }
                var blocTypeSort = localStorage.getItem(storagePrefix+"BlockTypesSort");
                if (blocTypeSort) {
                    $('#' + blocTypeSort).click();
                }
                var contentTypeSort = localStorage.getItem(storagePrefix + "ContentTypesSort");
                if (contentTypeSort) {
                    $('#' + contentTypeSort).click();
                }
            }

        });
    </script>
	<div class="epiemptybackground">
        <EPiServerUI:TabStrip id="menuTab" runat="server" GeneratesPostBack="false" targetid="tabView" CssClass="epi-tinyTabs">
			<EPiServerUI:Tab Text="<%$ Resources: EPiServer, admin.menutabs.admin %>" runat="server" id="AdminTab"/>
			<EPiServerUI:Tab Text="<%$ Resources: EPiServer, admin.menutabs.config  %>" runat="server" id="ConfigTab"/>
            <EPiServerUI:Tab Text="<%$ Resources: EPiServer, admin.menutabs.contenttypes %>" runat="server" id="ContentTypeTab"/>
		</EPiServerUI:TabStrip>
    </div>
    <asp:Panel ID="tabView" runat="server" CssClass="epi-adminSidebar episcroll">
        <asp:Panel ID="adminPanel" runat="server">
            <div class="epi-localNavigation">
                <ul>
                    <li class="epi-navigation-standard epi-navigation-selected">
                        <a href="#admin_accessRights_sub">
                            <episerver:translate text="/admin/menuheadings/accessrights" runat="server" />
                        </a>
                        <ul id="admin_accessRights_sub">
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="security.aspx">
                                    <episerver:translate text="#setsecurity" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="AdminGroup.aspx">
                                    <episerver:translate text="#admingroups" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="SearchUsers.aspx">
                                    <episerver:translate text="#searchuser" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="EditUser.aspx">
                                    <episerver:translate text="#createuser" runat="server" />
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li class="epi-navigation-standard epi-navigation-selected">
                        <a href="#admin_scheduledJobs_sub">
                            <episerver:translate text="/admin/menuheadings/scheduledjobs" runat="server" />
                        </a>
                        <ul id="admin_scheduledJobs_sub">
                        <asp:Repeater runat="server" ID="scheduledJobs">
                            <ItemTemplate>
                                 <li>
                                    <a class="epi-navigation-global_user_settings_shell_search " href="DatabaseJob.aspx?pluginId=<%# DataBinder.Eval(Container.DataItem, "ID") %>">
                                        <%# DataBinder.Eval(Container.DataItem, "DisplayName") %>
                                    </a>
                                </li>
                            </ItemTemplate>
                        </asp:Repeater>
                        <asp:PlaceHolder runat="server" ID="NoScheduledJobsInfo" Visible="False">
                            <li>
                                <episerver:translate text="/admin/menuheadings/noscheduledjobstext" runat="server" />
                            </li>
                        </asp:PlaceHolder>
                        </ul>
                    </li>
                    <li class="epi-navigation-standard epi-navigation-selected">
                        <a href="#admin_tools_sub">
                            <episerver:translate text="/admin/menuheadings/tools" runat="server" />
                        </a>
                        <ul id="admin_tools_sub">
                            <asp:Repeater runat="server" ID="plugInList">
                                <ItemTemplate>
                                    <li>
                                        <a class="epi-navigation-global_user_settings_shell_search " href="<%# ResolveUrl((string)DataBinder.Eval(Container.DataItem, "Url")) %>">
                                            <%# DataBinder.Eval(Container.DataItem, "DisplayName") %>
                                        </a>
                                    </li>
                                </ItemTemplate>
                            </asp:Repeater>
                            <asp:PlaceHolder runat="server" ID="NoToolsInfo" Visible="False">
                                <li>
                                    <episerver:translate text="/admin/menuheadings/notoolstext" runat="server" />
                                </li>
                            </asp:PlaceHolder>
                        </ul>
                    </li>
                </ul>
            </div>
        </asp:Panel>
        <asp:Panel ID="configPanel" runat="server">
        <div class="epi-localNavigation">
                <ul>
                    <li class="epi-navigation-standard epi-navigation-selected">
                        <a href="#admin_systemConfig_sub">
                            <episerver:translate text="/admin/menuheadings/systemconfiguration" runat="server" />
                        </a>
                        <ul id="admin_systemConfig_sub">
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="settings.aspx">
                                    <episerver:translate text="#settings" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="SiteInformationList.aspx">
                                    <episerver:translate text="#siteinformation" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="EditlanguageBranches.aspx">
                                    <episerver:translate text="#editlanguagebranches" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="Categories.aspx">
                                    <episerver:translate text="#editcategories" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="Frames.aspx">
                                    <episerver:translate text="#editframes" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="Tabs.aspx">
                                    <episerver:translate text="#editheadings" runat="server" />
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li class="epi-navigation-standard epi-navigation-selected">
                        <a href="#admin_propertyConfig_sub">
                            <episerver:translate text="/admin/menuheadings/propertyconfiguration" runat="server" />
                        </a>
                        <ul id="admin_propertyConfig_sub">
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="PageDefinitionType.aspx">
                                    <episerver:translate text="#datatypes" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " id="editDynamicProperties" href="EditDynProp.aspx" runat="server">
                                    <episerver:translate text="#editdynamicproperty" runat="server" />
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li class="epi-navigation-standard epi-navigation-selected">
                        <a href="#admin_security_sub">
                            <episerver:translate text="/admin/menuheadings/security" runat="server" />
                        </a>
                        <ul id="admin_security_sub">
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="Permission.aspx">
                                    <episerver:translate text="#setpermission" runat="server" />
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li class="epi-navigation-standard epi-navigation-selected">
                        <a href="#admin_toolSettings_sub">
                            <episerver:translate text="/admin/menuheadings/toolsettings" runat="server" />
                        </a>
                        <ul id="admin_toolSettings_sub">
                        <asp:Repeater runat="server" ID="plugInSettingsList">
                            <ItemTemplate>
                                <li>
                                    <a class="epi-navigation-global_user_settings_shell_search " href="<%# ResolveUrl((string)DataBinder.Eval(Container.DataItem, "Url")) %>">
                                        <%# DataBinder.Eval(Container.DataItem, "DisplayName") %>
                                    </a>
                                </li>
                            </ItemTemplate>
                        </asp:Repeater>
                        <asp:PlaceHolder runat="server" ID="NoToolSettingsInfo" Visible="False">
                            <li>
                                <episerver:translate text="/admin/menuheadings/notoolsettingstext" runat="server" />
                            </li>
                        </asp:PlaceHolder>
                        </ul>
                    </li>
                </ul>
            </div>
        </asp:Panel>
        <asp:Panel ID="contentTypePanel" runat="server">
            <div class="epi-localNavigation">
                <ul>
                    <li class="epi-navigation-standard epi-navigation-selected">
                        <a href="#admin_mangePageTypes_sub">
                            <episerver:translate ID="Translate2" text="/admin/menuheadings/managepagetypes" runat="server" />
                        </a>
                        <ul id="admin_mangePageTypes_sub">
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="EditPageTypeSettings.aspx?id=0">
                                    <episerver:translate ID="Translate3" text="#newpagetype" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="CopyPageType.aspx">
                                    <episerver:translate ID="Translate4" text="#copypagetype" runat="server" />
                                </a>
                            </li>
                            <li>
                                <a class="epi-navigation-global_user_settings_shell_search " href="ConvertPageType.aspx">
                                    <episerver:translate ID="Translate5" text="#convertpagetype" runat="server" />
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
         </asp:Panel>
    </asp:Panel>
    <EPiServerScript:ScriptResizeWindowEvent EventTargetClientNode="window" ResizeElementId="tabView" runat="server" />
</asp:Content>
