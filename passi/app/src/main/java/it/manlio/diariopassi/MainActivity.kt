package it.manlio.diariopassi

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContract
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.Period
import java.time.format.DateTimeFormatter

/*
 * Diario passi — legge i passi dal telefono e li consegna al Diario.
 *
 * Perché esiste: una pagina web non può leggere Health Connect, né oggi né mai.
 * Questa app fa quell'unico pezzo che al browser è vietato, e passa il numero
 * al Diario aprendogli un indirizzo. Stessa strada dell'app da polso: l'app
 * racconta, il Diario decide.
 *
 * Fa una cosa sola e nessun'altra: chiede il permesso di leggere i passi,
 * legge gli ultimi giorni, li mostra, li manda. Nessun dato esce da qui se non
 * quando lui tocca il tasto.
 */

private const val PASSI_V = 1
private const val INDIRIZZO = "https://manliograndi-del.github.io/diario/"
private const val GIORNI = 7

private val CARTA = Color.parseColor("#E9ECE6")
private val INCHIOSTRO = Color.parseColor("#141B18")
private val TENUE = Color.parseColor("#5B6661")
private val BLU = Color.parseColor("#1F4A6B")
private val ROSSO = Color.parseColor("#A3341F")

class MainActivity : ComponentActivity() {

    private lateinit var radice: LinearLayout
    private var stato = "avvio"          // avvio · niente · permesso · letti · errore
    private var giorni: List<Pair<LocalDate, Long>> = emptyList()
    private var dettaglio = ""

    private val permessi = setOf(HealthPermission.getReadPermission(StepsRecord::class))

    private val chiediPermessi =
        registerForActivityResult(contrattoPermessi()) { concessi: Set<String> ->
            if (concessi.containsAll(permessi)) leggi() else { stato = "permesso"; mostra() }
        }

    private fun contrattoPermessi(): ActivityResultContract<Set<String>, Set<String>> =
        PermissionController.createRequestPermissionResultContract()

    override fun onCreate(salvato: Bundle?) {
        super.onCreate(salvato)
        val sv = ScrollView(this)
        sv.setBackgroundColor(CARTA)
        radice = LinearLayout(this)
        radice.orientation = LinearLayout.VERTICAL
        val b = dp(22f)
        radice.setPadding(b, dp(40f), b, dp(40f))
        sv.addView(radice, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
        setContentView(sv)
        mostra()
        avvia()
    }

    override fun onResume() {
        super.onResume()
        if (stato == "permesso" || stato == "niente") avvia()
    }

    /* ---------- lettura ---------- */

    private fun avvia() {
        when (HealthConnectClient.getSdkStatus(this)) {
            HealthConnectClient.SDK_UNAVAILABLE -> { stato = "niente"; mostra() }
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> { stato = "niente"; mostra() }
            else -> lifecycleScope.launch {
                try {
                    val c = HealthConnectClient.getOrCreate(this@MainActivity)
                    val ok = c.permissionController.getGrantedPermissions()
                    if (ok.containsAll(permessi)) leggi() else chiediPermessi.launch(permessi)
                } catch (e: Exception) {
                    stato = "errore"; dettaglio = e.message ?: ""; mostra()
                }
            }
        }
    }

    private fun leggi() {
        stato = "avvio"; mostra()
        lifecycleScope.launch {
            try {
                val c = HealthConnectClient.getOrCreate(this@MainActivity)
                val oggi = LocalDate.now()
                val inizio = oggi.minusDays((GIORNI - 1).toLong())
                /* Aggregati per giorno: se più sorgenti scrivono i passi — il
                   telefono e un orologio — sommarli a mano li conterebbe due
                   volte. Questo è il conto che fa Health Connect. */
                val ris = c.aggregateGroupByPeriod(
                    AggregateGroupByPeriodRequest(
                        metrics = setOf(StepsRecord.COUNT_TOTAL),
                        timeRangeFilter = TimeRangeFilter.between(
                            inizio.atStartOfDay(), LocalDateTime.now()),
                        timeRangeSlicer = Period.ofDays(1)
                    )
                )
                val fuori = ArrayList<Pair<LocalDate, Long>>()
                for (r in ris) {
                    val n = r.result[StepsRecord.COUNT_TOTAL] ?: continue
                    if (n > 0) fuori.add(Pair(r.startTime.toLocalDate(), n))
                }
                fuori.sortByDescending { it.first }
                giorni = fuori
                stato = if (fuori.isEmpty()) "vuoto" else "letti"
                mostra()
            } catch (e: Exception) {
                stato = "errore"; dettaglio = e.message ?: ""; mostra()
            }
        }
    }

    /* ---------- consegna al Diario ---------- */

    private fun manda() {
        if (giorni.isEmpty()) return
        val f = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val dati = giorni.joinToString(",") { it.first.format(f) + ":" + it.second }
        val u = Uri.parse(INDIRIZZO + "#passi=" + PASSI_V + ";" + dati)
        try {
            startActivity(Intent(Intent.ACTION_VIEW)
                .addCategory(Intent.CATEGORY_BROWSABLE)
                .setData(u))
        } catch (e: Exception) {
            stato = "errore"; dettaglio = "Non riesco ad aprire il Diario."; mostra()
        }
    }

    /* ---------- disegno ---------- */

    private fun dp(v: Float): Int =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, resources.displayMetrics).toInt()

    private fun testo(t: String, sp: Float, colore: Int, grassetto: Boolean, sopra: Int = 0): TextView {
        val tv = TextView(this)
        tv.text = t
        tv.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp)
        tv.setTextColor(colore)
        if (grassetto) tv.setTypeface(Typeface.DEFAULT_BOLD)
        val lp = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        lp.topMargin = dp(sopra.toFloat())
        tv.layoutParams = lp
        return tv
    }

    private fun tasto(t: String, pieno: Boolean): TextView {
        val b = TextView(this)
        b.text = t
        b.gravity = Gravity.CENTER
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
        b.setTypeface(Typeface.DEFAULT_BOLD)
        b.setTextColor(if (pieno) Color.WHITE else INCHIOSTRO)
        b.setPadding(dp(18f), dp(15f), dp(18f), dp(15f))
        val sf = android.graphics.drawable.GradientDrawable()
        sf.cornerRadius = dp(3f).toFloat()
        if (pieno) sf.setColor(INCHIOSTRO) else { sf.setColor(Color.TRANSPARENT); sf.setStroke(dp(1f), INCHIOSTRO) }
        b.background = sf
        val lp = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        lp.topMargin = dp(14f)
        b.layoutParams = lp
        return b
    }

    private fun mostra() {
        radice.removeAllViews()
        radice.addView(testo("DIARIO", 11f, TENUE, true))
        radice.addView(testo("Passi", 32f, INCHIOSTRO, true, 2))

        when (stato) {
            "avvio" -> radice.addView(testo("Sto leggendo i passi…", 15f, TENUE, false, 18))

            "niente" -> {
                radice.addView(testo("Su questo telefono manca Health Connect, il magazzino da cui leggo i passi.",
                    15f, INCHIOSTRO, false, 18))
                val t = tasto("Installa Health Connect", true)
                t.setOnClickListener {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(
                            "market://details?id=com.google.android.apps.healthdata")))
                    } catch (e: Exception) {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(
                            "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata")))
                    }
                }
                radice.addView(t)
            }

            "permesso" -> {
                radice.addView(testo("Senza il permesso di leggere i passi non posso fare niente. È l'unico permesso che chiedo.",
                    15f, INCHIOSTRO, false, 18))
                val t = tasto("Dai il permesso", true)
                t.setOnClickListener { chiediPermessi.launch(permessi) }
                radice.addView(t)
            }

            "vuoto" -> radice.addView(testo(
                "Health Connect non ha passi degli ultimi giorni. Se conti i passi con Google Fit, apri Fit e controlla che stia condividendo i dati con Health Connect.",
                15f, INCHIOSTRO, false, 18))

            "errore" -> {
                radice.addView(testo("Qualcosa non ha funzionato.", 15f, ROSSO, true, 18))
                if (dettaglio.isNotEmpty()) radice.addView(testo(dettaglio, 12f, TENUE, false, 6))
                val t = tasto("Riprova", false)
                t.setOnClickListener { avvia() }
                radice.addView(t)
            }

            "letti" -> {
                radice.addView(testo("Ultimi giorni", 11f, TENUE, true, 22))
                val f = DateTimeFormatter.ofPattern("EEEE d MMMM")
                for (g in giorni) {
                    val riga = LinearLayout(this)
                    riga.orientation = LinearLayout.HORIZONTAL
                    val lp = LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
                    lp.topMargin = dp(10f)
                    riga.layoutParams = lp
                    val d = testo(g.first.format(f), 14f, TENUE, false)
                    d.layoutParams = LinearLayout.LayoutParams(0,
                        ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
                    val n = testo(String.format("%,d", g.second).replace(',', '.'), 18f, BLU, true)
                    n.layoutParams = LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
                    riga.addView(d); riga.addView(n)
                    radice.addView(riga)
                }
                val t = tasto("Manda al Diario", true)
                t.setOnClickListener { manda() }
                radice.addView(t)
                val r = tasto("Rileggi", false)
                r.setOnClickListener { leggi() }
                radice.addView(r)
                radice.addView(testo(
                    "Il Diario ti chiederà conferma prima di registrarli. Aggiorna solo i passi: quello che hai mangiato non lo tocca nessuno.",
                    12f, TENUE, false, 14))
            }
        }
    }
}
