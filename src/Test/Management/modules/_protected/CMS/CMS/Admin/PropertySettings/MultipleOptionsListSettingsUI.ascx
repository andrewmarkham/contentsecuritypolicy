<%@ Control Language="C#" AutoEventWireup="false" CodeBehind="MultipleOptionsListSettingsUI.ascx.cs" Inherits="EPiServer.UI.Admin.PropertySettings.MultipleOptionsListSettingsUI" %>
<%@ Register TagPrefix="EPiServer" Namespace="EPiServer.Web.WebControls" Assembly="EPiServer" %>

<div id="dropDownListSettingsContainer">
    <div>
        <span class="epi-paddingHorizontal-small">
            <label for="nameInput"><%= Translate("/admin/editpropertydefinition/multipleOptionsListUi/namecaption")%></label>
            <input type="text" id="nameInput" />
            <span class="hidden" style="color: Red;" id="nameInputValidationMessage">*</span>
        </span>
        <span class="epi-paddingHorizontal-small">
            <label for="valueInput"><%= Translate("/admin/editpropertydefinition/multipleOptionsListUi/valuecaption")%></label>
            <input type="text" id="valueInput" />
        </span>
        <EPiServerUI:ToolButton SkinID="Add" Text="<%$ Resources: EPiServer, button.add %>" OnClientClick="multipleOptionsListUi.addOption();" runat="server" GeneratesPostBack="false" DisablePageLeaveCheck="true"/>
        <br /><span class="hidden" style="color: Red;" id="inputValidationMessage"></span>
    </div>
    <table id="dropDownListTable" class="epi-default epi-table-sortable epi-marginVertical-small">
        <thead>
            <tr>
                <th><%= Translate("/admin/editpropertydefinition/multipleOptionsListUi/namecaption")%></th>
                <th><%= Translate("/admin/editpropertydefinition/multipleOptionsListUi/valuecaption")%></th>
                <th><%= Translate("/admin/categories/moveup")%></th>
                <th><%= Translate("/admin/categories/movedown")%></th>
                <th><%= Translate("/admin/editpropertydefinition/multipleOptionsListUi/deletecaption")%></th>
            </tr>
        </thead>
        <tbody>
            <% foreach (string key in Settings.ListOptions.Keys)
               { %>
                    <tr>
                        <td><input type="text" onchange="multipleOptionsListUi.updateOptionState();" value="<%= Server.HtmlEncode(key) %>" /> </td>
                        <td><input type="text" onchange="multipleOptionsListUi.updateOptionState();" value="<%= Server.HtmlEncode(Settings.ListOptions[key]) %>" /></td>
                        <td><a href="#" onclick="multipleOptionsListUi.move(this, false); return false;" class="epi-dropdownoption-moveup" title="<%= Translate("/admin/categories/moveup")%>"></a></td>
                        <td><a href="#" onclick="multipleOptionsListUi.move(this, true); return false;" class="epi-dropdownoption-movedown" title="<%= Translate("/admin/categories/movedown")%>"></a></td>
                        <td><a href="#" onclick="multipleOptionsListUi.deleteOption(this); return false;" class="epi-dropdownoption-delete" title="<%= Translate("/admin/editpropertydefinition/multipleOptionsListUi/deletecaption")%>"></a></td>
                    </tr>
            <%} %>
        </tbody>
    </table>
    <input runat="server" type="hidden" id="ReturnValue" />
</div>

<script type="text/javascript" src="<%=EPiServer.Shell.Paths.ToClientResource("cms", "ClientResources/jquery.tablednd.js")%>"></script>

<script type="text/javascript">
    var multipleOptionsListUi = {
        // Initializes the drop down list settings ui. Binds keypress on the input fields,
        // turns on the drag and drop support and set's the initial value for the return string
        initialize: function() {
            var isEnabled = '<%= IsEnabled() %>' === 'True' ? true : false;

            multipleOptionsListUi.updateOptionState();

            if (isEnabled) {
                $('#nameInput').bind("keypress", multipleOptionsListUi.handleEnterKey);
                $('#valueInput').bind("keypress", multipleOptionsListUi.handleEnterKey);

                // Initialize the table
                $("#dropDownListTable tbody").tableDnD({
                    onDragClass: "epi-table-sortableRow-drag",
                    onDrop: function(table, row) {
                        multipleOptionsListUi.updateOptionState();
                    }
                });
            }
            else {
                $("#dropDownListSettingsContainer input").attr("disabled", "disabled");
                $("#dropDownListSettingsContainer a").removeAttr("onclick").addClass("epi-dropdownoption-disabled");
            }

            $('.epi-cmsButton-Save').bind('click', function(e) {
                var counter = 0;
                $('#dropDownListTable input[type=text]').each(function() {
                    if (counter++ % 2 === 0 && !multipleOptionsListUi.validateName(this.value, 1)) {
                        $('#inputValidationMessage').toggle(true);
                        e.preventDefault();
                    }
                });
            });
        },

        // Get's the values from the input field and adds them to the table of drop down list options.
        addOption: function() {
            var nameInputBox = document.getElementById('nameInput');
            var valueInputBox = document.getElementById('valueInput');

            if (valueInputBox.value === '') {
                valueInputBox.value = nameInputBox.value;
            }

            var isInvalid = !multipleOptionsListUi.validateName(nameInputBox.value, 0);

            $('#nameInputValidationMessage').toggle(isInvalid);
            $('#inputValidationMessage').toggle(isInvalid);

            if (isInvalid) {
                return;
            }

            $('#dropDownListTable > tbody:last').append(multipleOptionsListUi.createTableRow(nameInputBox.value, valueInputBox.value));

            // Reset input boxes
            nameInputBox.value = '';
            valueInputBox.value = '';

            multipleOptionsListUi.updateOptionState();

            $("#dropDownListTable tbody").tableDnDUpdate();
        },

        validateName: function(name, legalOccurrences) {
            var emptyOptionProhibited = '<%= IsEmptyOptionProhibited() %>' === 'True' ? true : false;
            var emptyNameFailure = false;
            if (name === '' && emptyOptionProhibited) {
                emptyNameFailure = true;
                $('#inputValidationMessage')[0].innerHTML = '<%= Translate("/validation/formrequired")%>';
            }

            var occurrences = 0;
            var counter = 0;
            $('#dropDownListTable input[type=text]').each(function() {
                if (counter++ % 2 === 0 && this.value === name) {
                    occurrences++;
                }
            });

            var tooManyOccurrences = occurrences > legalOccurrences;
            if (tooManyOccurrences) {
                $('#inputValidationMessage')[0].innerHTML = '<%= Translate("/admin/editpropertydefinition/multipleoptionslistui/namenotunique")%>';
            }

            return !emptyNameFailure && !tooManyOccurrences;
        },

        // Deletes an option from the table of drop down list options.
        deleteOption: function(element) {
            $(element).closest('tr').remove();
            multipleOptionsListUi.updateOptionState();
        },

        // Returns one table row suitable for the table of drop down list options.
        createTableRow: function(name, value) {
            // Encode the input values
            name = $('<div/>').text(name).html().replace(/"/g, '&quot;');
            value = $('<div/>').text(value).html().replace(/"/g, '&quot;');

            return '<tr><td><input type="text" onchange="multipleOptionsListUi.updateOptionState();" value="' + name + '" /></td>' +
                   '<td><input type="text" onchange="multipleOptionsListUi.updateOptionState();" value="' + value + '" /></td>' +
                   '<td><a href="#" onclick="multipleOptionsListUi.move(this, false); return false;" class="epi-dropdownoption-moveup" title="<%= Translate("/admin/categories/moveup")%>"></a></td>' +
                   '<td><a href="#" onclick="multipleOptionsListUi.move(this, true); return false;" class="epi-dropdownoption-movedown" title="<%= Translate("/admin/categories/movedown")%>"></a></td>' +
                   '<td><a href="#" onclick="multipleOptionsListUi.deleteOption(this); return false;" class="epi-dropdownoption-delete" title="<%= Translate("/admin/editpropertydefinition/multipleOptionsListUi/deletecaption")%>"></a></td></tr>';
        },

        // Updates the state of the UI when the list of drop down options is changed.
        // The function is responsible for building the return value.
        updateOptionState: function() {
            var returnValueInput = document.getElementById('<%= ReturnValue.ClientID %>');
            var returnValue = '';

            $('#dropDownListTable input').each(function() {
                returnValue += this.value + '\u00A4|\u00A4'; // '¤|¤';
            });
            if (!returnValue) {
                $('#dropDownListTable tbody').append('<tr id="emptyRow"><td colspan="5"><%= Translate("/admin/editpropertydefinition/multipleOptionsListUi/nooptions")%></td></tr>');
            } else {
                $('#emptyRow').remove();
            }
            returnValueInput.value = returnValue.substr(0, returnValue.length - 3);

            multipleOptionsListUi.setMoveButtonsVisibility();
        },

        // Checks if the key pressed is the enter key, and if so, adds the drop down option.
        handleEnterKey: function(e) {
            if (e.keyCode === 13) {
                multipleOptionsListUi.addOption();
                e.stopPropagation();
                e.preventDefault();
            }
        },

        // Moves an option one step in the table. moveDown indicates the direction.
        move: function(element, moveDown) {
            var currentRow = $(element).closest('tr');

            if (moveDown) {
                currentRow.next('tr').after(currentRow);
            }
            else {
                currentRow.prev('tr').before(currentRow);
            }

            multipleOptionsListUi.updateOptionState();
        },

        // Will set the state of the move up / move down buttons. Hides the first move up and the last move down button.
        setMoveButtonsVisibility: function() {
            $('.epi-dropdownoption-moveup').show();
            $('.epi-dropdownoption-moveup:first').hide();
            $('.epi-dropdownoption-movedown').show();
            $('.epi-dropdownoption-movedown:last').hide();
        }
    };

    $(document).ready(multipleOptionsListUi.initialize);
</script>
