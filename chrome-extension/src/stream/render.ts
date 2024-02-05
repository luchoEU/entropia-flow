import Mustache from 'mustache'

function renderStream(data: any): string {
    const template =
    `<div id='stream' style='background-color: white; margin: 10px; width: 494px; height: 150px; position: relative;'>
        <div style='margin: 50px; position: absolute;'>
            <img style='width: 50px; position: absolute; top: 0px; left: 0px;' src={{logoSrc}}></img>
            <div style='font-size: 20px; font-weight: bold; position: absolute; top: 0px; left: 60px; width: 200px;'>
                Entropia Flow
            </div>
            <div style='font-size: 14px; position: absolute; top: 26px; left: 69px; width: 200px;'>
                Chrome Extension
            </div>
            <div style='width: 170px; margin: 0px; text-align: center; position: absolute; top: 0px; left: 208px;' class='difference {{deltaClass}}'>
                {{delta}} PED {{deltaWord}}
            </div>
            <div style='width: 170px; text-align: center; position: absolute; top: 36px; left: 208px;'>
                {{message}}
            </div>
        </div>
    </div>`
    return Mustache.render(template, data)
}

export default renderStream