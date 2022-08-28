export function designerInfoPopup(designerInfo) {
    const popup = L.popup( 
    {
        minWidth: 300,
        maxWidth: 350,
        // maxHeight: 300,
        closeButton: false,
        className: "designer-info"
    });

    const popupWrapper = document.createElement("div");
    popupWrapper.classList.add("designer-info-wrapper");
    // construct header
    const header = document.createElement("header");
    const name = document.createElement("h2");
    name.textContent = designerInfo.name;
    
    // close button wrapper
    const closeButtonWrapper = document.createElement("section");
    closeButtonWrapper.classList.add("popup-close-button-wrapper");
    const closeButton = document.createElement("button");

    closeButton.addEventListener("click", () => {
        popup.close();
    });

    const buttonImage = document.createElement("img");
    buttonImage.setAttribute("src", "./assets/images/icons8-close.svg");
    closeButton.appendChild(buttonImage);
    
    closeButtonWrapper.appendChild(closeButton);

    header.appendChild(name);
    header.appendChild(closeButtonWrapper);

    // construct info section
    const designerInfoWrapper = document.createElement("section");
    designerInfoWrapper.classList.add("about-designer")

    let designerInfoSection = document.createElement("section");
    designerInfoSection.classList.add("university");
    let sectionHeader = document.createElement("h3");
    sectionHeader.textContent = "university affiliation";
    designerInfoSection.appendChild(sectionHeader);
    let sectionContent = document.createElement("span");
    sectionContent.textContent = designerInfo.universityAffiliation ? designerInfo.universityAffiliation.toUpperCase() : "N/A";
    designerInfoSection.appendChild(sectionContent);
    designerInfoWrapper.appendChild(designerInfoSection);

    designerInfoSection = document.createElement("section");
    designerInfoSection.classList.add("community");
    sectionHeader = document.createElement("h3");
    sectionHeader.textContent = "community";
    designerInfoSection.appendChild(sectionHeader);
    sectionContent = document.createElement("span");
    sectionContent.textContent = designerInfo.communityAffiliation ? designerInfo.communityAffiliation.toUpperCase() : "N/A"
    designerInfoSection.appendChild(sectionContent);
    designerInfoWrapper.appendChild(designerInfoSection);

    designerInfoSection = document.createElement("section");
    designerInfoSection.classList.add("organization");
    sectionHeader = document.createElement("h3");
    sectionHeader.textContent = "lab/firm";
    designerInfoSection.appendChild(sectionHeader);
    sectionContent = document.createElement("span");
    sectionContent.textContent = designerInfo.organization ? designerInfo.organization.toUpperCase() : "N/A";
    designerInfoSection.appendChild(sectionContent);

    designerInfoWrapper.appendChild(designerInfoSection);

    designerInfoSection = document.createElement("links");
    designerInfoSection.classList.add("links");
    sectionHeader = document.createElement("h3");
    sectionHeader.textContent = "links";
    designerInfoSection.appendChild(sectionHeader);
    sectionContent = document.createElement("span");
    sectionContent.textContent = designerInfo.links ? designerInfo.links : "N/A";
    designerInfoSection.appendChild(sectionContent);

    designerInfoWrapper.appendChild(designerInfoSection);

    console.log(designerInfoWrapper);
    // designerInfoWrapper.innerHTML = `
    //     <section class="university">
    //         <h3>university affiliation</h3>
    //         ${designerInfo.universityAffiliation ? designerInfo.universityAffiliation.toUpperCase() : "N/A"}
    //     </section>
    //     <section class="community">
    //         <h3>community</h3>
    //         ${designerInfo.communityAffiliation ? designerInfo.communityAffiliation.toUpperCase() : "N/A"}
    //     </section>
    //     <section class="organization">
    //         <h3>lab/firm</h3>
    //         ${designerInfo.organization ? designerInfo.organization.toUpperCase() : "N/A"}
    //     </section>
    //     <section class="links">
    //         <h3>links</h3>
    //         ${designerInfo.links ? designerInfo.links : "N/A"}
    //     </section>
    // `
    
    popupWrapper.appendChild(header);
    popupWrapper.appendChild(designerInfoWrapper);

    popup.setContent(popupWrapper);
    return popup;
}

// The structure of the content of the popup
//     <header>
//         <h2>${designerInfo.name}</h2>
//         <section class="popup-close-button-wrapper">
//             <button>
//                 <img src="./assets/images/icons8-close.svg" id=${"popup-close-button-" + designerInfo.id.replace(" ", "").replace(",", "").replace(".", "-").replace(".", "-")}" />
//             </button>
//         </section>
//     </header>
//     <section class="about-designer">
//         <section class="university">
//             <h3>university affiliation</h3>
//             ${designerInfo.universityAffiliation ? designerInfo.universityAffiliation.toUpperCase() : "N/A"}
//         </section>
//         <section class="community">
//             <h3>community</h3>
//             ${designerInfo.communityAffiliation ? designerInfo.communityAffiliation.toUpperCase() : "N/A"}
//         </section>
//         <section class="organization">
//             <h3>lab/firm</h3>
//             ${designerInfo.organization ? designerInfo.organization.toUpperCase() : "N/A"}
//         </section>
//         <section class="links">
//             <h3>links</h3>
//             ${designerInfo.links ? designerInfo.links : "N/A"}
//         </section>
//     </section>
// `