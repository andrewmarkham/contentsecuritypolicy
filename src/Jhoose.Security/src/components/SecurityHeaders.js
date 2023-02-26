import React, { useState } from 'react';
import { DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody} from "@episerver/ui-framework";

export function SecurityHeaders(props) {

    const {data, save} = {...props};
    const [isEditOpen, setIsEditOpen] = useState(false);

    //const [currentPolicy, setCurrentPolicy] = useState(dummy);

    return(
        <>
            <p>Edit Security Headers</p>
        </>
    );
}



