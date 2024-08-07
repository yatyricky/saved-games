SellJunk = LibStub("AceAddon-3.0"):NewAddon("SellJunk", "AceConsole-3.0","AceEvent-3.0")
local addon	= LibStub("AceAddon-3.0"):GetAddon("SellJunk")
local AceConfigRegistry = LibStub("AceConfigRegistry-3.0")
local AceConfigDialog = LibStub("AceConfigDialog-3.0")

local addonName, addonTable = ...
local L = addonTable.L
local _

addon.optionsFrame = {}
local options = nil

addon.sellButton = CreateFrame("Button", nil, MerchantFrame, "UIPanelButtonTemplate")

if IsAddOnLoaded("GnomishVendorShrinker") then
  addon.sellButton:SetPoint("TOPRIGHT", -23, 0)
else
  addon.sellButton:SetPoint("TOPLEFT", 60, -32)
end
addon.sellButton:SetSize(80, 30)
addon.sellButton:SetText(L["Sell Junk"])
addon.sellButton:SetScript("OnClick", function() SellJunk:Sell() end)

-- upvalues
local floor = floor
local mod = mod
local string_find = string.find
local pairs = pairs
local wipe = wipe
local DeleteCursorItem = DeleteCursorItem
local GetContainerItemInfo = GetContainerItemInfo
local GetItemInfo = GetItemInfo
local PickupContainerItem = (C_Container.PickupContainerItem or PickupContainerItem)
local PickupMerchantItem = (C_Container.PickupMerchantItem or PickupMerchantItem)
local GetContainerNumSlots = (C_Container.GetContainerNumSlots or GetContainerNumSlots)
local GetContainerItemLink = (C_Container.GetContainerItemLink or GetContainerItemLink)


function addon:OnInitialize()
  self:RegisterChatCommand("selljunk", "HandleSlashCommands")
  self:RegisterChatCommand("sj", "HandleSlashCommands")

  self.db = LibStub("AceDB-3.0"):New("SellJunkDB")
  self.db:RegisterDefaults({
    char = {
      auto = false,
			max12 = true,
			printGold = true,
      showSpam = true,
      ignoreSoulbound = false
    },
    global = {
      exceptions = {},
    }
  })

  self:PopulateOptions()
  AceConfigRegistry:RegisterOptionsTable("SellJunk", options)
  addon.optionsFrame = AceConfigDialog:AddToBlizOptions("SellJunk", nil, nil, "general")
end

function addon:OnEnable()
  self:RegisterEvent("MERCHANT_SHOW")
	self.total = 0
end

function addon:MERCHANT_SHOW()
  if addon.db.char.auto then
    self:Sell()
  end
end

function addon:AddProfit(profit)
	if profit then
		self.total = self.total + profit
	end
end

-----------------------------------------------
-- Sells items: see CheckItemIsJunk comments --
-----------------------------------------------
function addon:Sell()
	local limit = 0
  local currPrice
  local showSpam = addon.db.char.showSpam
  local max12 = addon.db.char.max12

  for bag = 0,5 do
    for slot = 1,GetContainerNumSlots(bag) do
      local item = GetContainerItemLink(bag,slot)

      if self:CheckItemIsJunk(item,bag,slot) then
        currPrice = (select(11, GetItemInfo(item)) or 0) * (GetContainerItemInfo and select(2, GetContainerItemInfo(bag, slot)) or C_Container.GetContainerItemInfo(bag, slot).stackCount)
        -- this should get rid of problems with grey items, that cant be sell to a vendor
        if currPrice > 0 then
          addon:AddProfit(currPrice)
          PickupContainerItem(bag, slot)
          PickupMerchantItem()
          if showSpam then
            self:Print(L["Sold"]..": "..item)
          end

          if max12 then
            limit = limit + 1
            if limit == 12 then
              return
            end
          end
        end
      end
    end
  end

	if self.db.char.printGold then
		self:PrintGold()
	end
	self.total = 0
end

--------------------------------------------------
-- Destroys items: see CheckItemIsJunk comments --
--------------------------------------------------
function addon:Destroy(count)
  local limit = 9001 -- it's over NINE THOUSAND!!!
  if count ~= nil then
    limit = count
  end

  local showSpam = addon.db.char.showSpam

  for bag = 0,5 do
    for slot = 1,GetContainerNumSlots(bag) do
      local item = GetContainerItemLink(bag,slot)

      if self:CheckItemIsJunk(item,bag,slot) then
        PickupContainerItem(bag, slot)
        DeleteCursorItem()
        if showSpam then
          self:Print(L["Destroyed"]..": "..item)
        end
        limit = limit - 1
        if limit == 0 then
          break
        end
      end
    end
    if limit == 0 then
      break
    end
  end

	if self.db.char.printGold then
		self:PrintGold()
	end
	self.total = 0
end

function addon:PrintGold()
  if self.total > 0 then
		self:Print(L["Gained"]..": "..GetMoneyString(self.total))
	end
end

-------------------------------------------------------------------------------------------------------
-- Junk condition:                                                                                   --
--   - grey quality, unless it's in exception list, but...                                           --
--         ... not an armor or weapon, unless it's soulbound or marked to ignore soulbound           --
--   - better than grey quality, if it's in exception list                                           --
-------------------------------------------------------------------------------------------------------
function addon:CheckItemIsJunk(item,bag,slot)
	if not item then
		return false
	end

	-- is it grey quality item?
	local grey = string_find(item,"|cff9d9d9d")

	-- is it an armor or weapon?
	local _, _, _, _, _, sType, _, _ = GetItemInfo(item);
	local armor_weapon = ((sType == "Armor") or (sType == "Weapon"));

	-- is it soulbound?
	local isBound = C_Item.IsBound(ItemLocation:CreateFromBagAndSlot(bag,slot))

	-- ignore soulbound configuration
	local ignoreSoulbound = addon.db.char.ignoreSoulbound

	if grey and (not addon:isException(item)) then
		if (not armor_weapon) or (armor_weapon and isBound) or (ignoreSoulbound) then
			return true
		end
	end

	if (not grey) and (addon:isException(item)) then
		return true
	end

	return false
end

function addon:Add(link)

	-- remove all trailing whitespace
	link = strtrim(link)

	-- extract name from an itemlink
  local found, _, name = string_find(link, "^|c%x+|H.+|h.(.*)\].+")

	-- if it's not an itemlink, guess it's name of an item
	if not found then
		name = link
	end

  local exceptions = self.db.global.exceptions
  for k,v in pairs(exceptions) do
    if v == name or v == link then
      return
    end
  end

  -- append name of the item to global exception list
  exceptions[#exceptions + 1] = name
  self:Print(L["Added"] .. ": " .. link)
end

function addon:Rem(link)
	-- remove all trailing whitespace
	link = strtrim(link)

	-- extract name from an itemlink
  local isLink, _, name = string_find(link, "^|c%x+|H.+|h.(.*)\].+")

	-- if it's not an itemlink, guess it's name of an item
	if not isLink then
		name = link
	end

  -- looping through exceptions
  local found = false
  local exception
  local exceptions = self.db.global.exceptions
  for k,v in pairs(exceptions) do
    found = false
    -- comparing exception list entry with given name
    if v:lower() == name:lower() then
      found = true
    end

    -- extract name from itemlink (only for compatibility with old saved variables)
    isLink, _, exception = string_find(v, "^|c%x+|H.+|h.(.*)\].+")
    if isLink then
      -- comparing exception list entry with given name
      if exception:lower() == name:lower() then
        found = true
      end
    end

    if found then
      if exceptions[k + 1] then
        exceptions[k] = exceptions[k + 1]
      else
        exceptions[k] = nil
      end
      self:Print(L["Removed"]..": "..link)
      break
    end
  end
end

function addon:isException(link)
	local exception = nil

	-- extracting name of an item from the itemlink
	local isLink, _, name = string_find(link, "^|c%x+|H.+|h.(.*)\].+")

	-- it's not an itemlink, so guess it's name of the item
	if not isLink then
		name = link
	end

  local exceptions = self.db.global.exceptions
	if exceptions then

		-- looping through global exceptions
		for k,v in pairs(exceptions) do

			-- comparing exception list entry with given name
			if v:lower() == name:lower() then
				return true
			end

			-- extract name from itemlink (only for compatibility with old saved variables)
			isLink, _, exception = string_find(v, "^|c%x+|H.+|h.(.*)\].+")
			if isLink then
				-- comparing exception list entry with given name
				if exception:lower() == name:lower() then
					return true
				end
			end
		end
	end

	-- item not found in exception list
	return false
end

function addon:ClearDB()
  wipe(self.db.global.exceptions)
  self:Print(L["Exceptions succesfully cleared."])
end

function addon:HandleSlashCommands(input)
  local arg1, arg2 = self:GetArgs(input, 2, 1, input)
  if arg1 == 'destroy' then
    self:Destroy(arg2)
  elseif arg1 == 'add' and arg2 ~= nil then
    if arg2:find('|Hitem') == nil then
      self:Print(L["Command accepts only itemlinks."])
    else
      self:Add(arg2, true)
    end
  elseif (arg1 == 'rem' or arg1 == 'remove') and arg2 ~= nil then
    if arg2:find('|Hitem') == nil then
      self:Print(L["Command accepts only itemlinks."])
    else
      self:Rem(arg2, true)
    end
  else
    -- function InterfaceOptionsFrame_OpenToCategory deprecated
    -- InterfaceOptionsFrame_OpenToCategory(addon.optionsFrame)

    Settings.OpenToCategory("SellJunk")
  end
end

function addon:PopulateOptions()
	if not options then
		options = {
			order = 1,
			type  = "group",
			name  = "SellJunk",
			args  = {
				general = {
					order	= 1,
					type	= "group",
					name	= "global",
					args	= {
						divider1 = {
							order	= 1,
							type	= "description",
							name	= "",
						},
						auto = {
							order	= 2,
							type 	= "toggle",
							name 	= L["Automatically sell junk"],
							desc 	= L["Toggles the automatic selling of junk when the merchant window is opened."],
							get 	= function() return addon.db.char.auto end,
							set 	= function() self.db.char.auto = not self.db.char.auto end,
						},
						divider2 = {
							order	= 3,
							type	= "description",
							name	= "",
						},

						max12 = {
							order = 4,
							type  = "toggle",
							name  = L["Sell max. 12 items"],
							desc  = L["This is failsafe mode. Will sell only 12 items in one pass. In case of an error, all items can be bought back from vendor."],
							get 	= function() return addon.db.char.max12 end,
							set 	= function() self.db.char.max12 = not self.db.char.max12 end,
						},
						divider3 = {
							order	= 5,
							type	= "description",
							name	= "",
						},
						printGold = {
							order = 6,
							type  = "toggle",
							name  = L["Show gold gained"],
							desc  = L["Shows gold gained from selling trash."],
							get 	= function() return addon.db.char.printGold end,
							set 	= function() self.db.char.printGold = not self.db.char.printGold end,
						},
						divider4 = {
							order	= 7,
							type	= "description",
							name	= "",
						},
						showSpam = {
							order = 8,
							type  = "toggle",
							name  = L["Show 'item sold' spam"],
							desc  = L["Prints itemlinks to chat, when automatically selling items."],
							get   = function() return addon.db.char.showSpam end,
							set   = function() addon.db.char.showSpam = not addon.db.char.showSpam end,
						},
						divider5 = {
							order	= 9,
							type	= "description",
							name	= "",
						},
						ignoreSoulbound = {
							order = 10,
							type  = "toggle",
							name  = L["Ignore soulbound"],
							desc  = L["Ignore soulbound and sell/destroy items marked as BoE"],
							get   = function() return addon.db.char.ignoreSoulbound end,
							set   = function() addon.db.char.ignoreSoulbound = not addon.db.char.ignoreSoulbound end,
						},
						divider6 = {
							order	= 11,
							type	= "header",
							name	= L["Clear exceptions"],
						},
						clearglobal = {
							order	= 12,
							type 	= "execute",
							name 	= L["Clear"],
							desc  = L["Removes all exceptions."],
							func 	= function() addon:ClearDB() end,
						},
						divider7 = {
							order	= 13,
							type	= "description",
							name	= "",
						},
						header1 = {
							order	= 14,
							type	= "header",
							name	= L["Exceptions"],
						},
						note1 = {
							order = 15,
							type 	= "description",
							name	= L["Drag item into this window to add/remove it from exception list"],
						},
						add = {
							order	= 16,
							type 	= "input",
							name 	= L["Add item"]..':',
							usage = L["<Item Link>"],
							get 	= false,
							set 	= function(info, v) addon:Add(v) end,
						},
						rem = {
							order	= 17,
							type 	= "input",
							name 	= L["Remove item"]..':',
							usage 	= L["<Item Link>"],
							get 	= false,
							set 	= function(info, v) addon:Rem(v) end,
						},
					}
				}
			}
		}
	end
end
