import { FunctionComponent } from "react";

type SpecialTableProps = {
    title: string
    items: {
        id: string;
        label: string
    }[]
    selectedIds: string[];
    onSelectedIdsChange: (ids: string[]) => void;
    selectable: boolean;
}

const SpecialTable: FunctionComponent<SpecialTableProps> = ({title, items, selectedIds, onSelectedIdsChange, selectable}) => {
    return (
        <table>
            <thead>
                <tr>
                    {selectable && <th></th>}
                    <th>{title}</th>
                </tr>
            </thead>
            <tbody>
                {items.map(({id, label}) => (
                    <tr key={id}>
                        {selectable && <td>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        // onSelectedIdsChange([...selectedIds, id])
                                        onSelectedIdsChange([id])
                                    }
                                    else {
                                        onSelectedIdsChange(selectedIds.filter((x) => x !== id))
                                    }
                                }}
                            />
                        </td>}
                        <td>{label}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default SpecialTable;