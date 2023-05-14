const uu5StringTableTemplate = (rows, columns, header) => {
    return `<uu5string/>
        <UU5.Bricks.Lsi>
            <UU5.Bricks.Lsi.Item language="en">
                <UU5.Bricks.Section contentEditable level="3" header="${header.toUpperCase()}" colorSchema=null>
                    <UuContentKit.Bricks.BlockDefault>
                        <UU5.RichText.Block uu5string="Last update on ${new Date()}"/>
                    </UuContentKit.Bricks.BlockDefault>
                    <Uu5TilesBricks.Table 
                        data='<uu5json/>${JSON.stringify(rows)}' 
                        columns='<uu5json/>${JSON.stringify(columns)}'
                    />
                </UU5.Bricks.Section>
            </UU5.Bricks.Lsi.Item>
        </UU5.Bricks.Lsi>`;
}

module.exports = {
    uu5StringTableTemplate
}