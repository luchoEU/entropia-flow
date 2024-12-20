import React from "react"
import { useSelector } from "react-redux"
import { ConnectionState } from "../../application/state/connection"
import { getConnection } from "../../application/selectors/connection"
import { setConnectionClientExpanded, webSocketConnectionChanged } from "../../application/actions/connection"
import ExpandableSection from "../common/ExpandableSection"
import { Field } from "../common/Field"

function ConnectionPage() {
    const s: ConnectionState = useSelector(getConnection)
    
    return (
        <>
            <ExpandableSection title='Client' expanded={s.client.expanded} setExpanded={setConnectionClientExpanded}>
                <div className="form-settings">
                    <Field
                        label='WebSocket'
                        value={s.client.webSocket}
                        getChangeAction={webSocketConnectionChanged} />
                    <p>Status: {s.client.status} {s.client.message}</p>
                </div>
            </ExpandableSection>
        </>
    )
}

export default ConnectionPage