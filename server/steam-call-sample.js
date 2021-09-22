function HideGameHover( elem, event, divHover )
{
	var $Elem = $JFromIDOrElement( elem );
	var $Hover = $JFromIDOrElement( divHover );

	var oElemState = GetHoverState( $Elem );

	if ( !$Hover.length )
		return;

	if (!event) var event = window.event;
	var reltarget = $J( (event.relatedTarget) ? event.relatedTarget : event.toElement );
	if ( reltarget.length && $J.contains( $Elem[0], reltarget[0] ) )
		return;

	if ( oElemState.timer )
	{
		window.clearTimeout( oElemState.timer );
		oElemState.timer = false;
	}
	oElemState.bWantsHover = false;
	oElemState.bReadyForHover = false;

	HideWithFade( divHover, 200 );
}