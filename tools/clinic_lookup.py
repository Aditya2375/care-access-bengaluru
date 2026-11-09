"""Clinic lookup tool for the CareAccess Bengaluru care navigator."""

from typing import Optional
from ibm_watsonx_orchestrate.agent_builder.tools import tool, ToolPermission

FACILITIES: list[dict] = [
    {
        "id": "uphc-shivajinagar",
        "name": "BBMP UPHC Shivajinagar",
        "type": "uphc",
        "area": "Shivajinagar",
        "zone": "Central",
        "address": "BBMP Urban Primary Health Centre, Shivajinagar, Bengaluru – 560001",
        "phone": "080-22221600",
        "timings": "Mon–Sat 08:00–16:00",
        "services": ["general", "fever", "vaccination", "maternal", "child"],
        "documents_required": [
            "Aadhaar card or any government photo ID",
            "BBMP voter card (if available)",
        ],
    },
    {
        "id": "uphc-rajajinagar",
        "name": "BBMP UPHC Rajajinagar",
        "type": "uphc",
        "area": "Rajajinagar",
        "zone": "West",
        "address": "BBMP Urban Primary Health Centre, Rajajinagar, Bengaluru – 560010",
        "timings": "Mon–Sat 08:00–16:00",
        "services": ["general", "fever", "vaccination", "maternal", "child"],
        "documents_required": ["Aadhaar card or any government photo ID"],
    },
    {
        "id": "uphc-jayanagar",
        "name": "BBMP UPHC Jayanagar",
        "type": "uphc",
        "area": "Jayanagar",
        "zone": "South",
        "address": "BBMP Urban Primary Health Centre, Jayanagar 4th Block, Bengaluru – 560041",
        "timings": "Mon–Sat 08:00–16:00",
        "services": ["general", "fever", "vaccination", "maternal", "child"],
        "documents_required": ["Aadhaar card or any government photo ID"],
    },
    {
        "id": "uphc-yelahanka",
        "name": "BBMP UPHC Yelahanka",
        "type": "uphc",
        "area": "Yelahanka",
        "zone": "North",
        "address": "BBMP Urban Primary Health Centre, Yelahanka New Town, Bengaluru – 560064",
        "timings": "Mon–Sat 08:00–16:00",
        "services": ["general", "fever", "vaccination", "maternal", "child"],
        "documents_required": ["Aadhaar card or any government photo ID"],
    },
    {
        "id": "uphc-whitefield",
        "name": "BBMP UPHC Whitefield",
        "type": "uphc",
        "area": "Whitefield",
        "zone": "East",
        "address": "BBMP Urban Primary Health Centre, Whitefield Main Road, Bengaluru – 560066",
        "timings": "Mon–Sat 08:00–16:00",
        "services": ["general", "fever", "vaccination", "maternal", "child"],
        "documents_required": ["Aadhaar card or any government photo ID"],
    },
    {
        "id": "uphc-hsr-layout",
        "name": "BBMP UPHC HSR Layout",
        "type": "uphc",
        "area": "HSR Layout",
        "zone": "South",
        "address": "BBMP Urban Primary Health Centre, HSR Layout Sector 2, Bengaluru – 560102",
        "timings": "Mon–Sat 08:00–16:00",
        "services": ["general", "fever", "vaccination", "maternal", "child"],
        "documents_required": ["Aadhaar card or any government photo ID"],
    },
    {
        "id": "bbmp-referral-hosp-malleswaram",
        "name": "BBMP Referral Hospital Malleswaram",
        "type": "referral_hospital",
        "area": "Malleswaram",
        "zone": "West",
        "address": "BBMP Referral Hospital, 11th Cross, Malleswaram, Bengaluru – 560003",
        "phone": "080-23344100",
        "timings": "24 hours, 7 days",
        "services": ["general", "fever", "maternal", "child", "injury", "dental"],
        "documents_required": [
            "Aadhaar card or government photo ID",
            "Referral letter from UPHC (preferred, not mandatory for emergency)",
        ],
    },
    {
        "id": "bbmp-referral-hosp-jayanagar",
        "name": "BBMP Referral Hospital Jayanagar",
        "type": "referral_hospital",
        "area": "Jayanagar",
        "zone": "South",
        "address": "BBMP Referral Hospital, 9th Block, Jayanagar, Bengaluru – 560069",
        "timings": "24 hours, 7 days",
        "services": ["general", "fever", "maternal", "child", "injury", "dental"],
        "documents_required": [
            "Aadhaar card or government photo ID",
            "Referral letter from UPHC (preferred)",
        ],
    },
    {
        "id": "victoria-hospital",
        "name": "Victoria Hospital",
        "type": "government_specialty",
        "area": "City Market",
        "zone": "Central",
        "address": "Victoria Hospital, Ft. Road, Near City Market, Bengaluru – 560002",
        "phone": "080-26701150",
        "timings": "OPD: Mon–Sat 08:00–13:00; Emergency: 24 hours",
        "services": [
            "general",
            "fever",
            "maternal",
            "child",
            "injury",
            "cardiac",
            "cancer",
            "mental",
            "dental",
        ],
        "documents_required": [
            "Aadhaar card or government photo ID",
            "Referral letter for specialty OPD",
        ],
    },
    {
        "id": "bowring-lady-curzon",
        "name": "Bowring and Lady Curzon Hospital",
        "type": "government_specialty",
        "area": "Shivajinagar",
        "zone": "Central",
        "address": "Bowring and Lady Curzon Hospital, Hospital Road, Shivajinagar, Bengaluru – 560001",
        "phone": "080-25320750",
        "timings": "OPD: Mon–Sat 08:00–13:00; Emergency: 24 hours",
        "services": ["general", "fever", "maternal", "child", "injury", "dental"],
        "documents_required": [
            "Aadhaar card or government photo ID",
            "Referral letter for specialty OPD (preferred)",
        ],
    },
    {
        "id": "kc-general-hospital",
        "name": "KC General Hospital",
        "type": "government_specialty",
        "area": "Malleswaram",
        "zone": "West",
        "address": "KC General Hospital, Malleshwaram, Bengaluru – 560003",
        "phone": "080-23460280",
        "timings": "OPD: Mon–Sat 08:00–13:00; Emergency: 24 hours",
        "services": ["general", "fever", "maternal", "child", "injury", "dental"],
        "documents_required": [
            "Aadhaar card or government photo ID",
            "Referral letter from UPHC or referral hospital (preferred)",
        ],
    },
    {
        "id": "esic-hospital-rajajinagar",
        "name": "ESIC Hospital Rajajinagar",
        "type": "government_specialty",
        "area": "Rajajinagar",
        "zone": "West",
        "address": "ESIC Hospital, Rajajinagar Industrial Area, Bengaluru – 560010",
        "phone": "080-23150330",
        "timings": "OPD: Mon–Sat 08:00–14:00; Emergency: 24 hours",
        "services": ["general", "fever", "maternal", "child", "injury", "dental", "cardiac"],
        "documents_required": ["ESIC card", "Aadhaar card or government photo ID"],
    },
    {
        "id": "jayadeva-cardiovascular",
        "name": "Sri Jayadeva Institute of Cardiovascular Sciences and Research",
        "type": "government_specialty",
        "area": "Jayanagar",
        "zone": "South",
        "address": (
            "Sri Jayadeva Institute of Cardiovascular Sciences and Research, "
            "Bannerghatta Road, Jayanagar 9th Block, Bengaluru – 560069"
        ),
        "phone": "080-22977777",
        "timings": "OPD: Mon–Sat 08:00–13:00; Emergency: 24 hours",
        "services": ["cardiac"],
        "documents_required": [
            "Aadhaar card or government photo ID",
            "Referral letter",
            "Previous ECG/echo reports if available",
        ],
    },
    {
        "id": "kidwai-oncology",
        "name": "Kidwai Memorial Institute of Oncology",
        "type": "government_specialty",
        "area": "Hombegowda Nagar",
        "zone": "South",
        "address": (
            "Kidwai Memorial Institute of Oncology, Dr. M H Marigowda Road, "
            "Hombegowda Nagar, Bengaluru – 560029"
        ),
        "phone": "080-26094000",
        "timings": "OPD: Mon–Sat 08:00–13:00; Emergency: 24 hours",
        "services": ["cancer"],
        "documents_required": [
            "Aadhaar card or government photo ID",
            "Referral letter",
            "Biopsy/pathology reports if available",
        ],
    },
    {
        "id": "nimhans",
        "name": "NIMHANS (National Institute of Mental Health and Neuro Sciences)",
        "type": "government_specialty",
        "area": "Lakkasandra",
        "zone": "South",
        "address": "NIMHANS, Hosur Road, Lakkasandra, Bengaluru – 560029",
        "phone": "080-46110007",
        "timings": "OPD: Mon–Sat 08:00–13:00; Emergency: 24 hours",
        "services": ["mental"],
        "documents_required": [
            "Aadhaar card or government photo ID",
            "Referral letter (strongly recommended for OPD)",
        ],
    },
    {
        "id": "igich",
        "name": "Indira Gandhi Institute of Child Health",
        "type": "government_specialty",
        "area": "Dharmaram College Post",
        "zone": "South",
        "address": (
            "Indira Gandhi Institute of Child Health, "
            "Dharmaram College Post, Bengaluru – 560029"
        ),
        "phone": "080-26563574",
        "timings": "OPD: Mon–Sat 08:00–13:00; Emergency: 24 hours",
        "services": ["child"],
        "documents_required": [
            "Aadhaar card or government photo ID (child + guardian)",
            "Referral letter (preferred)",
        ],
    },
]

# ---------------------------------------------------------------------------
# Routing logic
# ---------------------------------------------------------------------------

# Needs that should go straight to a specialty government hospital
_SPECIALTY_NEEDS: set[str] = {"cardiac", "cancer", "mental"}

# Needs that require at least a referral hospital (not just a UPHC)
_REFERRAL_NEEDS: set[str] = {"injury", "dental"}


def _recommend_facility_type(need: str, has_id: bool) -> str:
    """Return the recommended facility type label for a given need.

    Args:
        need: The care need string.
        has_id: Whether the resident has an ID / referral document.
    Returns:
        One of 'uphc', 'referral_hospital', or 'government_specialty'.
    """
    if need in _SPECIALTY_NEEDS:
        return "government_specialty"
    if need in _REFERRAL_NEEDS:
        return "referral_hospital"
    return "uphc"


def _area_match_score(facility: dict, area: str) -> int:
    """Return a simple match score between a facility and an area string.

    Args:
        facility: Facility record dict.
        area: Requested area string.
    Returns:
        2 for exact area match, 1 for same zone, 0 otherwise.
    """
    area_lower = area.lower()
    if facility["area"].lower() == area_lower:
        return 2
    if facility["zone"].lower() in area_lower or area_lower in facility["zone"].lower():
        return 1
    return 0


@tool(permission=ToolPermission.READ_ONLY)
def clinic_lookup(
    area: str,
    need: str,
    has_id: bool,
    language: Optional[str] = "en",
) -> dict:
    """Look up suitable government health facilities in Bengaluru for a resident's care need.

    Searches a curated static dataset of BBMP UPHCs, BBMP referral hospitals, and
    government specialty hospitals and returns the appropriate facility type, up to
    three ranked matches, a consolidated documents list, and a call-ahead note. This
    tool never provides medical advice and never diagnoses; it is a navigation aid only.
    Args:
        area: Neighbourhood or locality in Bengaluru (e.g. 'Jayanagar', 'Whitefield').
        need: Type of care needed. Must be one of: general, fever, maternal, child,
            dental, mental, cardiac, cancer, injury, vaccination.
        has_id: True if the resident has a government-issued ID or referral letter.
        language: Preferred language code – 'en' (English), 'kn' (Kannada), or
            'hi' (Hindi). Defaults to 'en'. Currently affects the call-ahead note only.
    Returns:
        A dict with keys:
            facility_type (str): Recommended facility type.
            facilities (list[dict]): Up to 3 matching facilities, each with name,
                type, address, phone (if known), timings, services, and
                documents_required.
            documents (list[str]): Deduplicated list of documents to bring.
            call_ahead_note (str): Localised reminder to call the facility before visiting.
            disclaimer (str): Standard non-medical-advice disclaimer.
    """
    valid_needs = {
        "general", "fever", "maternal", "child", "dental",
        "mental", "cardiac", "cancer", "injury", "vaccination",
    }
    if need not in valid_needs:
        return {
            "error": (
                f"Invalid need '{need}'. "
                f"Must be one of: {', '.join(sorted(valid_needs))}."
            )
        }

    recommended_type = _recommend_facility_type(need, has_id)

    # For specialty needs only specialty hospitals can serve them; for others prefer
    # the recommended type but fall back up the chain so the user always gets results.
    type_preference: list[str]
    if recommended_type == "government_specialty":
        type_preference = ["government_specialty"]
    elif recommended_type == "referral_hospital":
        type_preference = ["referral_hospital", "government_specialty"]
    else:
        type_preference = ["uphc", "referral_hospital", "government_specialty"]

    # Filter to facilities that can serve this need
    candidates = [f for f in FACILITIES if need in f["services"]]

    # Score and rank: primary key = area match, secondary = type preference order
    def _rank_key(facility: dict) -> tuple[int, int]:
        area_score = _area_match_score(facility, area)
        try:
            type_score = type_preference.index(facility["type"])
        except ValueError:
            type_score = len(type_preference)
        return (-area_score, type_score)

    candidates.sort(key=_rank_key)

    # Keep at most 3
    top = candidates[:3]

    # Deduplicate documents across selected facilities
    seen: set[str] = set()
    documents: list[str] = []
    for f in top:
        for doc in f.get("documents_required", []):
            if doc not in seen:
                seen.add(doc)
                documents.append(doc)

    call_ahead_notes: dict[str, str] = {
        "en": (
            "Please call the facility on the number listed before you visit "
            "to confirm timings and availability."
        ),
        "kn": (
            "ದಯವಿಟ್ಟು ಭೇಟಿ ನೀಡುವ ಮೊದಲು ಸಮಯ ಮತ್ತು ಲಭ್ಯತೆಯನ್ನು ದೃಢೀಕರಿಸಲು "
            "ನೀಡಿದ ದೂರವಾಣಿ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ."
        ),
        "hi": (
            "कृपया जाने से पहले सूचीबद्ध फ़ोन नंबर पर सुविधा केंद्र को कॉल करें "
            "और समय व उपलब्धता की पुष्टि करें।"
        ),
    }
    lang = language if language in call_ahead_notes else "en"
    call_ahead_note = call_ahead_notes[lang]

    disclaimer = (
        "This is a navigation aid only. It is not medical advice and does not "
        "constitute a diagnosis. Always consult a qualified health professional."
    )

    return {
        "facility_type": recommended_type,
        "facilities": [
            {
                "name": f["name"],
                "type": f["type"],
                "address": f["address"],
                **({"phone": f["phone"]} if "phone" in f else {}),
                "timings": f["timings"],
                "services": f["services"],
                "documents_required": f["documents_required"],
            }
            for f in top
        ],
        "documents": documents,
        "call_ahead_note": call_ahead_note,
        "disclaimer": disclaimer,
    }
