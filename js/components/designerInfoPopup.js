export function designerInfoPopup(designerInfo) {
    const popup = L.popup( 
    {
        minWidth: 300,
        maxWidth: 350,
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

    designerInfoSection = document.createElement("section");
    designerInfoSection.classList.add("links");
    sectionHeader = document.createElement("h3");
    sectionHeader.textContent = "links";
    designerInfoSection.appendChild(sectionHeader);
    if (designerInfo.links.length) {
        sectionContent = document.createElement("ul");
        for (let link of designerInfo.links) {
            let listElement = document.createElement("li");
            let anchor = document.createElement("a");
            anchor.href = link;
            anchor.textContent = link;
            anchor.target = "_blank";
            listElement.appendChild(anchor);
            sectionContent.appendChild(listElement);
        }
    } else {
        sectionContent = document.createElement("span");
        sectionContent.textContent = "N/A";
    }
    
    designerInfoSection.appendChild(sectionContent);

    designerInfoWrapper.appendChild(designerInfoSection);

    popupWrapper.appendChild(header);
    popupWrapper.appendChild(designerInfoWrapper);

    popup.setContent(popupWrapper);
    return popup;
}
