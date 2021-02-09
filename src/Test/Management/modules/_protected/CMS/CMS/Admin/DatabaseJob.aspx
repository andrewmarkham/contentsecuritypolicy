<%@ Page Language="c#" CodeBehind="DatabaseJob.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.DatabaseJob"
     Title="DatabaseJob" %>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">



    <script type="text/javascript" language="javascript">
         (function($) {
             $(document).ready(function() {
                 var isJobRunning = <%=IsJobRunning.ToString().ToLower() %>;
                 var isJobStoppable = <%=IsJobStoppable.ToString().ToLower() %>;
                 var isJobStopping = <%=IsJobStopping.ToString().ToLower() %>;
                 
                 var listenForStatusChanges = function() {
                     $.ajax({
                         type: 'POST',
                         url: "DatabaseJob.aspx?GetRunningState=<%=ScheduledJobId %>",
                         data: '{}',
                         contentType: 'application/json; charset=utf-8',
                         dataType: 'json',
                         success: function(data) {
                             // If the job is running show the runningstate div
                             if (data.IsRunning) {
                                 isJobRunning = true;
                                 EPi.ToolButton.SetEnabled('<%=stopRunningJobButton.ClientID%>', true);
                                 if(!isJobStopping){
                                    $("#runningState").show();
                                 }
                                 
                                 if(typeof(data.CurrentStatusMessage) === "string"){
                                    $("#currentStatusMessage").text(" - " + data.CurrentStatusMessage);
                                 }

                                 //Start the timer
                                 setTimeout(listenForStatusChanges, 5000);
                             } else {
                                 EPi.ToolButton.SetEnabled('<%=stopRunningJobButton.ClientID%>', false);
                                 $("#runningState").hide();
                                 $("#stoppingState").hide();
                                 $("#completedState").show();
                             }
                         }
                     });
                 };
                
                if(isJobRunning){
                    //Start to listen for status changes
                    listenForStatusChanges();
                    
                    $("#jobStatus").show();
                    if(isJobStopping){
                        $("#runningState").hide();
                        $("#stoppingState").show();
                    }
                }
                
                //If we click save we want to hide the old messages so any validation message show instead.
                $(".epi-cmsButton-Save").click(function() {$(".EP-systemMessage").hide();});
                
             });
         } (epiJQuery));
    </script>

    <div id="jobStatus" class="hidden EP-systemMessage">
        <ul>
            <li id="runningState" class="hidden">
                <%= Translate("/admin/databasejob/jobisrunning") %>
                <span id="currentStatusMessage"></span>
            </li>
            <li id="stoppingState" class="hidden">
                <%= Translate("/admin/databasejob/jobisstopping") %>
            </li>
            <li id="completedState" class="hidden">
                <%= Translate("/admin/databasejob/jobcompleted") %>
            </li>
        </ul>
    </div>
    
    <EPiServerUI:TabStrip runat="server" ID="actionTab" GeneratesPostBack="True" TargetID="TabView">
		<EPiServerUI:Tab Text="#tabsettings" runat="server" ID="Tab1" sticky="True" />
		<EPiServerUI:Tab Text="#tabhistory" runat="server" ID="Tab2" sticky="True" />
    </EPiServerUI:TabStrip>
    <asp:Panel ID="TabView" runat="server">
        <asp:Panel ID="GeneralSettings" runat="server">
            <div class="epi-formArea epi-padding">
                <div class="epi-size15">
                    <div class="epi-indent">
                        <asp:CheckBox ID="isActiveInput" runat="server" OnCheckedChanged="IsActive_CheckedChange" AutoPostBack="true" />
                        <asp:Label runat="server" AssociatedControlID="isActiveInput" Translate="#activecaption" />
                    </div>
                    <div>
                        <asp:Label runat="server" AssociatedControlID="frequencyInput" Translate="#schedulecaption" />
                        <asp:TextBox SkinID="Small" ID="frequencyInput" runat="server" CssClass="EP-requiredField" />
                        <asp:DropDownList ID="recurrenceInput" SkinID="Custom" runat="server">
                        </asp:DropDownList>
                        <asp:RangeValidator ID="frequencyInputRange" ControlToValidate="frequencyInput" MinimumValue="1" MaximumValue="1440" Type="Integer" EnableClientScript="true" Text="*" runat="server" />
                        <asp:RequiredFieldValidator ID="frequencyInputRequired" ControlToValidate="frequencyInput" Text="*" EnableClientScript="true" runat="server" />
                        <asp:RequiredFieldValidator InitialValue="0" ID="recurrenceInputRequired" ControlToValidate="recurrenceInput" Text="*" EnableClientScript="true" runat="server" />
                    </div>
                    <div>
                        <asp:Label runat="server" AssociatedControlID="nextExecutionInput" Translate="#nextexecution" />
                        <EPiServer:InputDate ID="nextExecutionInput" runat="server" DisplayName="#nextexecution" style="display: inline;" />
                    </div>
                </div>
            </div>
            <div class="epi-buttonContainer">
                <EPiServerUI:ToolButton ID="saveChanges" OnClick="SaveChanges_Click" Text="<%$ Resources: EPiServer, button.save %>"
                    ToolTip="<%$ Resources: EPiServer, button.save %>" SkinID="Save" runat="server" /><EPiServerUI:ToolButton ID="startNowButton" OnClick="StartNow_Click" Text="<%$ Resources: EPiServer, admin.databasejob.testbutton %>"
                    ToolTip="<%$ Resources: EPiServer, admin.databasejob.testbutton %>" SkinID="MySettings"
                    runat="server" CausesValidation="false" /><EPiServerUI:ToolButton ID="stopRunningJobButton" OnClick="StopRunningJob_Click"
                    Text="<%$ Resources: EPiServer, admin.databasejob.stopRunningJob %>" ToolTip="<%$ Resources: EPiServer, admin.databasejob.stopRunningJob %>"
                    SkinID="Cancel" runat="server" CausesValidation="false" />
            </div>
        </asp:Panel>
        <asp:Panel ID="Log" runat="server" CssClass="epi-padding">
            <br />
            <asp:DataGrid ID="logGrid" AutoGenerateColumns="False" runat="server" PageSize="20"
                OnPageIndexChanged="ChangePaging" AllowPaging="True" EnableViewState="True" UseAccessibleHeader="true">
                <PagerStyle Mode="NumericPages" CssClass="epipager" />
                <Columns>
                    <asp:TemplateColumn HeaderStyle-CssClass="epitableheading" HeaderText="<%$ Resources: EPiServer, admin.databasejob.logdate%>">
                        <ItemTemplate><%# Started(Container.DataItem) %></ItemTemplate>
                    </asp:TemplateColumn>
                    <asp:TemplateColumn HeaderStyle-CssClass="epitableheading" HeaderText="<%$ Resources: EPiServer, admin.databasejob.duration%>">
                        <ItemTemplate><%# FormatDuration(Container.DataItem) %></ItemTemplate>
                    </asp:TemplateColumn>
                    <asp:TemplateColumn HeaderStyle-CssClass="epitableheading" HeaderText="<%$ Resources: EPiServer, admin.databasejob.logstatus%>">
                        <ItemTemplate><%# DataBinder.Eval(Container.DataItem, "Status") %></ItemTemplate>
                    </asp:TemplateColumn>
                     <asp:TemplateColumn HeaderStyle-CssClass="epitableheading" HeaderText="<%$ Resources: EPiServer, admin.databasejob.server%>">
                        <ItemTemplate><%# DataBinder.Eval(Container.DataItem, "Server") %></ItemTemplate>
                    </asp:TemplateColumn>
                    <asp:TemplateColumn HeaderStyle-CssClass="epitableheading" HeaderText="<%$ Resources: EPiServer, admin.databasejob.logmessage%>">
                        <ItemTemplate><%# DataBinder.Eval(Container.DataItem, "Message") %></ItemTemplate>
                    </asp:TemplateColumn>
                </Columns>
            </asp:DataGrid>
        </asp:Panel>
    </asp:Panel>
</asp:Content>
