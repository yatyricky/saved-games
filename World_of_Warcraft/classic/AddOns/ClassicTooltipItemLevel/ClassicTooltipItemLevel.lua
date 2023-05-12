local function AddItemlevelToTooltip( tooltip ) 
	local itemName, itemLink = tooltip:GetItem()

	if not itemName then
		return
	end
	
	local itemLevel,_,_,_,_,_,_,_,itemClassID = select( 4, GetItemInfo( itemLink ) )

	if itemLevel == nil then
		return
	end
	
	if not (itemClassID == 2 or itemClassID == 4) then
		return
	end
	
	local isComparisonToolip = false
	for i = 1, select("#", tooltip:GetRegions()) do
        local region = select(i, tooltip:GetRegions())
        if region and region:GetObjectType() == "FontString" then
            local regionText = region:GetText()
			local regionName = region:GetName()
			if regionName == "ShoppingTooltip1TextLeft1" or regionName == "ShoppingTooltip2TextLeft1" then
				isComparisonToolip = true
			elseif regionText and isComparisonToolip then
				region:SetText(regionText .. " (" .. itemLevel .. ")")
				break
			end
        end
    end
	
	if not isComparisonToolip then
		tooltip:AppendText( " (" .. itemLevel .. ")" )
	end
end

local function HookTooltips()
	GameTooltip:HookScript("OnTooltipSetItem", AddItemlevelToTooltip )
	ItemRefTooltip:HookScript( "OnTooltipSetItem", AddItemlevelToTooltip )
	ShoppingTooltip1:HookScript( "OnTooltipSetItem", AddItemlevelToTooltip )
	ShoppingTooltip2:HookScript( "OnTooltipSetItem", AddItemlevelToTooltip )
	ShoppingTooltip3:HookScript( "OnTooltipSetItem", AddItemlevelToTooltip )
end

HookTooltips()
