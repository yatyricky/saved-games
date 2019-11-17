SLASH_NEFSMARTHEAL1 = "/nefsmartheal"
SlashCmdList["NEFSMARTHEAL"] = function(msg)
    local _, _, sid, hpLoss = string.find(msg, "(%d+) (%d+)")
    if not sid or not hpLoss then
        print("/nefsmartheal [SpellId] [HPLoss]")
        return
    end
    sid = tonumber(sid)
    hpLoss = tonumber(hpLoss)
    SendChatMessage("sid="..sid..", hploss="..hpLoss, "SAY")
    local unit, i
    for i = 1, 40 do
        unit = "raid" .. i
        if UnitExists(unit) and UnitIsVisible(unit) and UnitIsFriend(unit) and IsSpellInRange(sid, "spell", unit) and UnitHealthMax(unit) - UnitHealth(unit) > hpLoss then
            TargetUnit(unit)
            CastSpell(sid, "spell")
            TargetLastTarget()
            break
        end
    end
end
