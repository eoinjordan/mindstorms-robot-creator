package com.eoinedge.robotinventor

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.json.JSONArray

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RobotInventorApp()
        }
    }
}

data class RobotProfile(
    val id: String,
    val name: String,
    val kind: String,
    val source: String,
    val confidence: String,
    val ports: List<RobotPort>
)

data class RobotPort(
    val port: String,
    val type: String,
    val role: String
)

@Composable
fun RobotInventorApp() {
    val context = LocalContext.current
    val profiles = remember { loadProfiles(context.assets.open("robot_profiles_51515.json").bufferedReader().readText()) }
    var selected by remember { mutableStateOf(profiles.first()) }
    var probeResult by remember { mutableStateOf(simulateProbe(selected)) }

    MaterialTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFFF4F7F7)
        ) {
            Row(modifier = Modifier.fillMaxSize()) {
                FleetList(
                    profiles = profiles,
                    selected = selected,
                    onSelect = {
                        selected = it
                        probeResult = simulateProbe(it)
                    }
                )
                RobotDetail(
                    profile = selected,
                    probeResult = probeResult,
                    onProbe = { probeResult = simulateProbe(selected) }
                )
            }
        }
    }
}

@Composable
fun FleetList(
    profiles: List<RobotProfile>,
    selected: RobotProfile,
    onSelect: (RobotProfile) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .width(220.dp)
            .fillMaxSize()
            .background(Color(0xFF172026))
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "51515 Fleet",
                color = Color.White,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(8.dp))
        }
        items(profiles) { profile ->
            val active = profile.id == selected.id
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(if (active) Color(0xFF008F8F) else Color(0xFF25333A))
                    .clickable { onSelect(profile) }
                    .padding(12.dp)
            ) {
                Column {
                    Text(profile.name, color = Color.White, fontWeight = FontWeight.Bold)
                    Text(profile.kind, color = Color(0xFFD9E5E5), style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

@Composable
fun RobotDetail(
    profile: RobotProfile,
    probeResult: String,
    onProbe: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(profile.name, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text(profile.kind, style = MaterialTheme.typography.titleMedium, color = Color(0xFF415058))
            Spacer(Modifier.height(8.dp))
            Text("Source: ${profile.source}")
            Text("Confidence: ${profile.confidence}")
        }
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Button(onClick = onProbe) {
                    Text("Run simulated probe")
                }
                Spacer(Modifier.width(12.dp))
                Text(probeResult, color = Color(0xFF006A6A), fontWeight = FontWeight.Bold)
            }
        }
        item {
            Text("Ports", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
        items(profile.ports) { port ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Port ${port.port}", fontWeight = FontWeight.Bold)
                        Text(port.role)
                    }
                    Text(port.type, color = Color(0xFF006A6A), fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

fun loadProfiles(raw: String): List<RobotProfile> {
    val array = JSONArray(raw)
    return (0 until array.length()).map { index ->
        val item = array.getJSONObject(index)
        val portsArray = item.getJSONArray("ports")
        val ports = (0 until portsArray.length()).map { portIndex ->
            val port = portsArray.getJSONObject(portIndex)
            RobotPort(
                port = port.getString("port"),
                type = port.getString("type"),
                role = port.getString("role")
            )
        }
        RobotProfile(
            id = item.getString("id"),
            name = item.getString("name"),
            kind = item.getString("kind"),
            source = item.getString("source"),
            confidence = item.getString("confidence"),
            ports = ports
        )
    }
}

fun simulateProbe(profile: RobotProfile): String {
    val motors = profile.ports.count { it.type == "motor" }
    val sensors = profile.ports.count { it.type == "sensor" }
    val label = when {
        profile.kind.contains("quadruped") -> "walker signature"
        profile.kind.contains("modular") -> "steer + drive signature"
        profile.kind.contains("sports") -> "drive + kicker signature"
        profile.kind.contains("launcher") -> "drive + arm + action signature"
        else -> "body motion signature"
    }
    return "$label: $motors motors, $sensors sensors"
}
