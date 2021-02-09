<%@ Page language="c#" Codebehind="DateBrowser.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Edit.DateBrowser"  Title="DateBrowser" %>
<%@ Import Namespace="EPiServer.Framework.Web.Mvc.Html"%>
<%@ Register TagPrefix="EPiServer" Namespace="EPiServer.Web.WebControls" Assembly="EPiServer" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
    <link type="text/css" rel="Stylesheet" href="<%= EPiServer.UriSupport.ResolveUrlFromUtilBySettings("styles/DateBrowser.css") %>" />
    <%=Page.ClientResources("ShellCore")%>
    <%=Page.ClientResources("ShellCoreLightTheme")%>
</asp:Content>

<asp:Content ContentPlaceHolderID="FullRegion" runat="server">

		<script type='text/javascript'>
		//<!--
		if(typeof EPi == "undefined" || !EPi)
		{
		    window.EPi = {};
		}
		if(!EPi.GetDialog)
		{
            EPi.GetDialog = function()
            {
                if (window.opener && window.opener.EPiOpenedDialog)
                {
                    return window.opener.EPiOpenedDialog;
                }
                else if (window.top.EPiOpenedDialog)
                {
                    return window.top.EPiOpenedDialog;
                }
            }
		}
		
				
		var aMonth				= new Array();
		var aMonthName			= new Array('<%#TranslateForScript("/january")%>','<%#TranslateForScript("/february")%>','<%#TranslateForScript("/march")%>','<%#TranslateForScript("/april")%>','<%#TranslateForScript("/may")%>','<%#TranslateForScript("/june")%>','<%#TranslateForScript("/july")%>','<%#TranslateForScript("/august")%>','<%#TranslateForScript("/september")%>','<%#TranslateForScript("/october")%>','<%#TranslateForScript("/november")%>','<%#TranslateForScript("/december")%>');
		var CALENDAR			= new CDateConstants(1,2,3,4,5,6,7);
		var nSelectedIndex		= null;
		var nTodayIndex			= null;
		var oToday				= new CCalendarDate(<%#Current.Year%>,<%#Current.Month%>,<%#Current.Year%>,<%#Current.Month%>,<%#Current.Day%>,<%#Current.Hour%>,<%#Current.Minute%>);
		var sSelectMonthCaption = '<%#TranslateForScript("/system/datebrowser/selectmonthcaption")%>';
		var sSelectYearCaption	= '<%#TranslateForScript("/system/datebrowser/selectyearcaption")%>';

		var oCalendar			= new CCalendarDate(<%#Current.Year%>,<%#Current.Month%>,<%#Current.Year%>,<%#Current.Month%>,<%#Current.Day%>,<%#Current.Hour%>,<%#Current.Minute%>);		
		window.onload			= OnLoadHandler;
		var fNoTimeRow			= <%# DisableTimeRow()  %>;
        var fButtons            = <%# DisplayButtons()  %>;

		function OnLoadHandler()
		{
			document.body.onclick	= OnClickHandler;
			RenderView();
			LoadTimeSelector();
			if (fNoTimeRow) 
			{
			    document.getElementById("timerow").style.display = "none";
			}
            if (!fButtons) 
			{
			    document.getElementById("buttonsrow").style.display = "none";
			}

		}

		//-->
		</script>		

			<div class="epi-paddingVertical-small" style="margin-left: auto; margin-right: auto; width: 175px;">
                <div class="panel">
                    <a href="javascript:void(0);" class="epi-floatLeft" onclick="StepMonth(-1);return false;"><img alt="" src='<%=this.GetImageThemeUrl("DateBrowser/LeftArrow.gif") %>' border="0" /></a>
                    <a href="javascript:void(0);" class="epi-floatRight" onclick="StepMonth(1);return false;"><img alt="" border="0" src='<%=GetImageThemeUrl("DateBrowser/RightArrow.gif") %>' /></a>
                    <div id="MonthNavigator"></div>
                </div>

			    <table class="dateTable" border="0" cellpadding="0" cellspacing="0">
			        <tr>
				        <td class="weekDay"><%#Translate("/monday").Substring(0,2)%></td>
				        <td class="weekDay"><%#Translate("/tuesday").Substring(0,2)%></td>
				        <td class="weekDay"><%#Translate("/wednesday").Substring(0,2)%></td>
				        <td class="weekDay"><%#Translate("/thursday").Substring(0,2)%></td>
				        <td class="weekDay"><%#Translate("/friday").Substring(0,2)%></td>
				        <td class="weekDay"><%#Translate("/saturday").Substring(0,2)%></td>
				        <td class="weekDay" style="color: Red;"><%#Translate("/sunday").Substring(0,2)%></td>
			        </tr>
			        <tr>
				        <td onclick="OnDateChanged(this)" class="date" id="date0"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date1"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date2"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date3"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date4"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date5"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date6"></td>
			        </tr>
			        <tr>
				        <td onclick="OnDateChanged(this)" class="date" id="date7"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date8"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date9"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date10"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date11"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date12"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date13"></td>
			        </tr>
			        <tr>
				        <td onclick="OnDateChanged(this)" class="date" id="date14"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date15"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date16"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date17"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date18"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date19"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date20"></td>
			        </tr>
			        <tr>
				        <td onclick="OnDateChanged(this)" class="date" id="date21"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date22"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date23"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date24"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date25"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date26"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date27"></td>
			        </tr>
			        <tr>
				        <td onclick="OnDateChanged(this)" class="date" id="date28"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date29"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date30"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date31"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date32"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date33"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date34"></td>
			        </tr>
			        <tr>
				        <td onclick="OnDateChanged(this)" class="date" id="date35"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date36"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date37"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date38"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date39"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date40"></td>
				        <td onclick="OnDateChanged(this)" class="date" id="date41"></td>
			        </tr>
			    </table>
			
		        <div id="timerow" class="panel">
			        <label for="f_time"><%#Translate("/system/datebrowser/time")%></label> <select id="f_time" name="f_time"></select>
		        </div>
		        
            </div>
                
                <div id="buttonsrow" class="epi-buttonContainer">
                    <EPiServerUI:ToolButton runat="server" IsDialogButton="true" Text='<%#Translate("/button/ok")%>' OnClientClick="onOK()" GeneratesPostBack="false" />
                    <EPiServerUI:ToolButton runat="server" IsDialogButton="true" Text='<%#Translate("/button/clear")%>' OnClientClick="onClear()" GeneratesPostBack="false" />
                    <EPiServerUI:ToolButton runat="server" IsDialogButton="true" Text='<%#Translate("/button/cancel")%>' OnClientClick="onCancel()" GeneratesPostBack="false" />
                </div>


			<span id="MonthMenu" class="panel" style="display:none;position:absolute;width:90px"></span>
			<span id="YearMenu" class="panel" style="display:none;position:absolute;width:60px;"></span>

</asp:Content>
