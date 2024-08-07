-- ------------------------------------------------------------------------------ --
--                                TradeSkillMaster                                --
--                          https://tradeskillmaster.com                          --
--    All Rights Reserved - Detailed license information included with addon.     --
-- ------------------------------------------------------------------------------ --

local LibTSMUI = select(2, ...).LibTSMUI
local UIElements = LibTSMUI:Include("Util.UIElements")
local Theme = LibTSMUI:From("LibTSMService"):Include("UI.Theme")
local private = {}
local STRING_RIGHT_PADDING = 4



-- ============================================================================
-- Element Definition
-- ============================================================================

local Text = UIElements.Define("Text", "Element")
Text:_ExtendStateSchema()
	:AddStringField("textStr", "")
	:AddBooleanField("autoWidth", false)
	:AddStringField("color", "TEXT", Theme.IsValidColor)
	:AddStringField("font", "BODY_BODY1")
	:AddStringField("justifyH", "LEFT")
	:AddStringField("justifyV", "MIDDLE")
	:AddNumberField("textSpacing", 0)
	:Commit()



-- ============================================================================
-- Public Class Methods
-- ============================================================================

function Text:__init(frame)
	frame = frame or self:_CreateFrame()
	self.__super:__init(frame)
	frame.text = self:_CreateFontString(frame)
	frame.text:SetAllPoints()
end

function Text:Acquire()
	self.__super:Acquire()
	local frame = self:_GetBaseFrame()

	-- Set the font
	self._state:PublisherForKeyChange("font")
		:CallMethod(frame.text, "TSMSetFont")

	-- Set the text spacing
	self._state:PublisherForKeys("font", "textStr")
		:MapWithFunction(private.StateToFontSpacing)
		:IgnoreDuplicates()
		:AssignToTableKey(self._state, "textSpacing")
	self._state:PublisherForKeyChange("textSpacing")
		:CallMethod(frame.text, "SetSpacing")

	-- Set the justification
	self._state:PublisherForKeyChange("justifyH")
		:CallMethod(frame.text, "SetJustifyH")
	self._state:PublisherForKeyChange("justifyV")
		:CallMethod(frame.text, "SetJustifyV")

	-- Set the text color
	self._state:PublisherForKeyChange("color")
		:CallMethod(frame.text, "TSMSubscribeTextColor")

	-- Set the text
	self._state:PublisherForKeyChange("textStr")
		:CallMethod(frame.text, "SetText")

	self._state:PublisherForKeys("textSpacing", "textStr", "autoWidth")
		:IgnoreIfKeyEquals("autoWidth", false)
		:CallMethod(self, "_DrawForAutoWidth")
end

---Sets the width of the text.
---@generic T: Text
---@param self T
---@param width? number|"AUTO" The width of the text, "AUTO" to set the width based on the length of the text, or nil to have an undefined width
---@return T
function Text:SetWidth(width)
	if width == "AUTO" then
		self._state.autoWidth = true
	else
		self._state.autoWidth = false
		self.__super:SetWidth(width)
	end
	return self
end

---Sets the font.
---@generic T: Text
---@param self T
---@param font string The font key
---@return T
function Text:SetFont(font)
	assert(Theme.GetFont(font))
	self._state.font = font
	return self
end

---Sets the color of the text.
---@param color string The text color as a theme color key
---@return Text
function Text:SetTextColor(color)
	self._state.color = color
	return self
end

---Subscribes to a publisher to set the text color.
---@generic T: Text
---@param self T
---@param publisher ReactivePublisher The publisher
---@return T
function Text:SetTextColorPublisher(publisher)
	self:AddCancellable(publisher:CallMethod(self, "SetTextColor"))
	return self
end

---Sets the horizontal justification of the text.
---@param justifyH '"LEFT"'|'"CENTER"'|'"RIGHT"' The horizontal justification
---@return Text
function Text:SetJustifyH(justifyH)
	assert(justifyH == "LEFT" or justifyH == "CENTER" or justifyH == "RIGHT")
	self._state.justifyH = justifyH
	return self
end

---Sets the vertical justification of the text.
---@param justifyV '"TOP"'|'"MIDDLE"'|'"BOTTOM"' The vertical justification
---@return Text
function Text:SetJustifyV(justifyV)
	assert(justifyV == "TOP" or justifyV == "MIDDLE" or justifyV == "BOTTOM")
	self._state.justifyV = justifyV
	return self
end

---Set the text.
---@param text string|number The text
---@return Text
function Text:SetText(text)
	if type(text) == "number" then
		text = tostring(text)
	end
	assert(type(text) == "string")
	self._state.textStr = text
	return self
end

---Subscribes to a publisher to set the text.
---@generic T: Text
---@param self T
---@param publisher ReactivePublisher The publisher
---@return T
function Text:SetTextPublisher(publisher)
	self:AddCancellable(publisher:CallMethod(self, "SetText"))
	return self
end

---Set formatted text.
---@param ... string The format string and parameters
---@return Text
function Text:SetFormattedText(...)
	self:SetText(format(...))
	return self
end

---Gets the text string.
---@return string
function Text:GetText()
	return self._state.textStr
end

---Get the rendered text string width.
---@return number
function Text:GetStringWidth()
	return self:_GetBaseFrame().text:GetStringWidth()
end

---Get the rendered text string height.
---@return number
function Text:GetStringHeight()
	return self:_GetBaseFrame().text:GetStringHeight()
end



-- ============================================================================
-- Private Class Methods
-- ============================================================================

function Text:_GetMinimumDimension(dimension)
	if dimension == "WIDTH" and self._state.autoWidth then
		return 0, self._width == nil
	else
		return self.__super:_GetMinimumDimension(dimension)
	end
end

function Text:_GetPreferredDimension(dimension)
	if dimension == "WIDTH" and self._state.autoWidth then
		return self:GetStringWidth() + STRING_RIGHT_PADDING
	else
		return self.__super:_GetPreferredDimension(dimension)
	end
end

function Text:_DrawForAutoWidth()
	local parent = self:GetParentElement()
	if parent then
		parent:Draw()
	end
end



-- ============================================================================
-- Private Helper Functions
-- ============================================================================

function private.StateToFontSpacing(state)
	if not state.font then
		return 0
	end
	-- There's a Blizzard bug where spacing incorrectly gets applied to embedded textures, so just set it to 0 in that case
	-- TODO: come up with a better fix if we need multi-line text with embedded textures
	if strfind(state.textStr, "|[TA]") then
		return 0
	end
	return Theme.GetFont(state.font):GetSpacing()
end
