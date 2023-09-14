
TomTomDB = {
	["profileKeys"] = {
		["Ziadwan - Azshara"] = "Default",
		["Lynndaw - Azshara"] = "Default",
	},
	["profiles"] = {
		["Default"] = {
			["arrow"] = {
				["position"] = {
					"CENTER", -- [1]
					nil, -- [2]
					"CENTER", -- [3]
					0, -- [4]
					0, -- [5]
				},
			},
			["block"] = {
				["position"] = {
					"TOPRIGHT", -- [1]
					nil, -- [2]
					"TOPRIGHT", -- [3]
					-59.16798400878906, -- [4]
					-19.99992942810059, -- [5]
				},
			},
		},
	},
}
TomTomWaypoints = nil
TomTomWaypointsM = {
	["profileKeys"] = {
		["Ziadwan - Azshara"] = "Ziadwan - Azshara",
		["Lynndaw - Azshara"] = "Lynndaw - Azshara",
	},
	["profiles"] = {
		["Ziadwan - Azshara"] = {
			[2023] = {
				["2023:469700000:728400000:17 Mirror of the Sky (Near the top of the mountain)"] = {
					2023, -- [1]
					0.4697, -- [2]
					0.7284, -- [3]
					["arrivaldistance"] = 15,
					["crazy"] = true,
					["persistent"] = true,
					["desc"] = "17 Mirror of the Sky (Near the top of the mountain)",
					["silent"] = true,
					["cleardistance"] = 10,
					["title"] = "17 Mirror of the Sky (Near the top of the mountain)",
					["from"] = "TomTom/way",
					["callbacks"] = {
						["distance"] = {
							[10] = nil --[[ skipped inline function ]],
							[15] = nil --[[ skipped inline function ]],
						},
						["world"] = {
							["onclick"] = nil --[[ skipped inline function ]],
							["tooltip_update"] = nil --[[ skipped inline function ]],
							["tooltip_show"] = nil --[[ skipped inline function ]],
						},
						["minimap"] = {
							["onclick"] = nil --[[ skipped inline function ]],
							["tooltip_update"] = nil --[[ skipped inline function ]],
							["tooltip_show"] = nil --[[ skipped inline function ]],
						},
					},
					["minimap"] = true,
					["world"] = true,
				},
			},
		},
		["Lynndaw - Azshara"] = {
		},
	},
}
