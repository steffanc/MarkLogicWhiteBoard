xquery version "1.0-ml";
declare namespace ns = "http://localhost/main";
let $receivedData := xdmp:unquote(xdmp:get-request-field("data"))
let $boardDir := fn:concat(xdmp:get-request-field("board"), "/")
let $imgDir := fn:concat("images/", $boardDir)
let $textDir := fn:concat("text/", $boardDir)
let $textDoc := fn:concat($textDir, "text.xml")
let $textBlock := xdmp:get-request-field("textBlock")
return
(
	if (fn:exists($receivedData/data/images/i))
	then
		for $i in $receivedData/data/images/i
		return
		(
			xdmp:document-set-property($i/@u, <x>{data($i/@x)}</x>)
			,
			xdmp:document-set-property($i/@u, <y>{data($i/@y)}</y>)
			,
			xdmp:document-set-property($i/@u, <z>{data($i/@z)}</z>)
		)
	else
		()
	,
	for $img in xdmp:directory($imgDir)
	let $imgUri := xdmp:node-uri($img)
	let $xCoord := xdmp:document-get-properties($imgUri, xs:QName("x"))
	let $yCoord := xdmp:document-get-properties($imgUri, xs:QName("y"))
	let $zCoord := xdmp:document-get-properties($imgUri, xs:QName("z"))
	return
		if (empty($receivedData/data/comments/c/@u) or not($imgUri eq $receivedData/data/comments/c/@u))
		then
			<i s="get-image.xqy?uri={xdmp:url-encode($imgUri)}" x="{$xCoord}" y="{$yCoord}" z="{$zCoord}">
			{
				xdmp:document-get-properties($imgUri, xs:QName("comments"))
			}
			</i>
		else
			let $comment := $receivedData/data/comments/c[@u eq $imgUri]
			let $numComments := $comment/@numComments
			let $node := xdmp:document-get-properties($imgUri, xs:QName("com"))
			return
				if($comment/@u eq $receivedData/data/images/i/@u)
				then
					<i s="get-image.xqy?uri={xdmp:url-encode($imgUri)}">
					{
						$node[$numComments to count($node)]
					}
					</i>
				else
					<i s="get-image.xqy?uri={xdmp:url-encode($imgUri)}" x="{$xCoord}" y="{$yCoord}" z="{$zCoord}">
					{
						$node[$numComments to count($node)]
					}
					</i>
	,
	for $i in $receivedData/data/text/t
	let $textNode := <t id="{$i/@id}" x="{$i/@x}" y="{$i/@y}">{$textBlock}</t>
	return
		if($i/@id eq fn:doc($textDoc)/text/t/@id) then
			xdmp:node-replace(fn:doc($textDoc)/text/t[@id eq $i/@id], $textNode)
		else
			xdmp:node-insert-child(fn:doc($textDoc)/text, $textNode)
	,
	for $textNode in fn:doc($textDoc)/text/t
	where not($textNode/@id eq $receivedData/data/text/t/@id)
	return $textNode
)
