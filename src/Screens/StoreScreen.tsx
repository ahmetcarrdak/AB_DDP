import React, {memo} from 'react'

import HeaderComponent from "../Components/HeaderComponent";

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';

DataTable.use(DT);

const StoreScreen = memo(() => {
    const columns = [
        {data: 'name'},
        {data: 'position'},
        {data: 'office'},
        {data: 'extn'},
        {data: 'start_date'},
        {data: 'salary'},
    ];
    return (
        <div className="screen">
            <div className="screen-header">
                <HeaderComponent/>
            </div>
            <div className="screen-body">
                <DataTable
                    ajax="/data.json"
                    columns={columns}
                    className="display"
                >
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Office</th>
                        <th>Extn.</th>
                        <th>Start date</th>
                        <th>Salary</th>
                    </tr>
                    </thead>
                </DataTable>
            </div>
        </div>

    )
})
export default StoreScreen
