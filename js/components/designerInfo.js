export function designerInfoHTML(designerInfo) {
    return `
        <header>
            <h2>${designerInfo.name}</h2>
            <section class="popup-close-button-wrapper">
                <img src="./assets/images/icons8-close.svg" />
            </section>
        </header>
        <section class="about-designer">
            <section class="university">
                <h3>university affiliation</h3>
                ${designerInfo.universityAffiliation ? designerInfo.universityAffiliation.toUpperCase() : "N/A"}
            </section>
            <section class="community">
                <h3>community</h3>
                ${designerInfo.communityAffiliation ? designerInfo.communityAffiliation.toUpperCase() : "N/A"}
            </section>
            <section class="organization">
                <h3>lab/firm</h3>
                ${designerInfo.organization ? designerInfo.organization.toUpperCase() : "N/A"}
            </section>
            <section class="links">
                <h3>links</h3>
                ${designerInfo.links ? designerInfo.links : "N/A"}
            </section>
        </section>
    `
}