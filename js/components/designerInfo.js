export function designerInfoHTML(designerInfo) {
    return `
        <div>
            <h2>${designerInfo.name}</h2>
            <section>
                ${designerInfo.universityAffiliation}
                ${designerInfo.communityAffiliation}
                ${designerInfo.organization}
                ${designerInfo.links}
            </section>
        </div>
    `
}