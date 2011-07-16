xquery version "1.0-ml";
declare namespace ns = "http://localhost/main";
(: get the content after hostname:portnumber; substring of 2 to get rid of the leading "/" character:)
let $urlExt := fn:substring(xdmp:get-request-url(), 2)
let $redirUrl := "index.xqy"
let $textXML := fn:concat("text/", $urlExt, "/", "text.xml")
let $textXMLDefault := fn:concat("text/main/", "text.xml")
let $textDocInit := <text boardId="{$urlExt}"></text>
let $textDocInitDefault := <text boardId="main"></text>
return
	if(fn:matches($urlExt, "^[a-zA-Z0-9_]*$"))
	then
	(
		if(fn:compare($urlExt, "") eq 0 and not(fn:exists(fn:doc($textXMLDefault))))
		then
			xdmp:document-insert($textXMLDefault, $textDocInitDefault)
		else if(not(fn:compare($urlExt, "") eq 0) and not(fn:exists(fn:doc($textXML))))
		then
			xdmp:document-insert($textXML, $textDocInit)
		else
			()
		,
		$redirUrl
	)
	else
		$urlExt
